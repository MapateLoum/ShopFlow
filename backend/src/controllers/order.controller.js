const prisma = require("../utils/prisma");

// Client passe une commande
const createOrder = async (req, res) => {
  try {
    const { storeId, clientName, clientEmail, clientPhone, items } = req.body;
    // items: [{ productId, quantity }]

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || store.status !== "ACTIVE")
      return res.status(404).json({ success: false, message: "Boutique introuvable" });

    // Vérifier stock et calculer total
    let totalAmount = 0;
    const enrichedItems = [];
    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, storeId, isAvailable: true },
      });
      if (!product) return res.status(400).json({ success: false, message: `Produit introuvable: ${item.productId}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Stock insuffisant pour: ${product.name}` });

      totalAmount += product.price * item.quantity;
      enrichedItems.push({ ...item, unitPrice: product.price });
    }

    // Créer ou trouver le client
    let client = await prisma.client.findFirst({ where: { email: clientEmail } });
    if (!client) {
      client = await prisma.client.create({
        data: { name: clientName, email: clientEmail, phone: clientPhone },
      });
    }

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        storeId,
        clientId: client.id,
        totalAmount,
        items: {
          create: enrichedItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: { include: { product: true } }, client: true },
    });

    // Décrémenter stock
    for (const item of enrichedItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Notifier le vendeur
    const seller = await prisma.seller.findFirst({ where: { store: { id: storeId } } });
    if (seller) {
      await prisma.notification.create({
        data: {
          sellerId: seller.id,
          type: "NEW_ORDER",
          message: `Nouvelle commande de ${clientName} - ${totalAmount.toLocaleString()} FCFA`,
        },
      });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur lors de la commande" });
  }
};

// Vendeur voit ses commandes
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { storeId: req.user.storeId },
      include: { items: { include: { product: true } }, client: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

// Vendeur met à jour le statut
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findFirst({ where: { id, storeId: req.user.storeId } });
    if (!order) return res.status(404).json({ success: false, message: "Commande introuvable" });

    const updated = await prisma.order.update({ where: { id }, data: { status } });
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

// Stats vendeur
const getOrderStats = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ where: { storeId: req.user.storeId } });
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);

    res.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        todayOrders: todayOrders.length,
        pendingOrders: orders.filter((o) => o.status === "PENDING").length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

module.exports = { createOrder, getMyOrders, updateOrderStatus, getOrderStats };
