# 🛍️ ShopFlow

**ShopFlow** est une plateforme SaaS e-commerce multi-vendeurs pensée pour le marché sénégalais. Elle permet à n'importe quel vendeur — cosmétiques, alimentation, vêtements — de créer sa boutique en ligne en quelques minutes, sans avoir besoin de coder.

---

## 💡 Pourquoi ShopFlow ?

Au Sénégal, beaucoup de vendeurs gèrent leurs ventes uniquement via WhatsApp ou Instagram, sans système de commande ni paiement en ligne structuré. ShopFlow leur offre un outil professionnel, simple et adapté à leurs besoins.

---

## ✨ Fonctionnalités

### Pour les vendeurs
- Création de boutique en ligne avec URL unique (`/boutique/mon-shop`)
- Personnalisation : logo, bannière, couleur principale
- Gestion des produits (ajout, modification, suppression, stock)
- Suivi des commandes en temps réel (en attente → confirmé → en livraison → livré)
- Tableau de bord : chiffre d'affaires, commandes du jour, produits populaires
- Notifications à chaque nouvelle commande

### Pour les clients
- Navigation sur les boutiques publiques
- Panier et passage de commande
- Paiement en ligne via **Wave Business**

### Pour l'administrateur
- Validation et gestion des comptes vendeurs
- Vue globale sur la plateforme

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Express.js + Node.js |
| Frontend | Angular 17 (Standalone) |
| Base de données | MongoDB Atlas + Prisma ORM |
| Auth | JWT + OTP par email |
| Stockage images | Cloudinary |
| Paiement | Wave Business API |
| Déploiement | Render (back) + Vercel (front) |

---

## 🌐 Pages de l'application

| Page | Description |
|------|-------------|
| `/` | Accueil — liste des boutiques actives |
| `/boutique/:slug` | Boutique publique d'un vendeur |
| `/auth/register` | Inscription vendeur (multi-étapes) |
| `/seller/dashboard` | Tableau de bord vendeur |
| `/seller/products` | Gestion des produits |
| `/seller/orders` | Gestion des commandes |
| `/admin/dashboard` | Espace super admin |

---

## 🎨 Design

- Couleur primaire : `#6C63FF` (violet)
- Accent : `#4ECDC4` (turquoise)
- Responsive mobile-first
- Polices : Inter + Plus Jakarta Sans

---

Projet développé avec ❤️ pour le marché sénégalais.