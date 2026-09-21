# Notion Clone

Application de prise de notes et de bases de données structurées : pages
composées de blocs éditables, imbricables et réorganisables, avec des bases
de données affichables sous plusieurs vues.

Stack : Next.js (App Router, TypeScript strict), PostgreSQL + Prisma,
TailwindCSS + shadcn/ui, TipTap, Auth.js, Vitest + Playwright.

## État du projet

Voir l'avancement par jalon ci-dessous. Le projet est livré incrémentalement ;
seul ce qui est coché est considéré terminé et testé dans le navigateur.

- [x] **Jalon 1 — Fondations** : schéma Prisma, authentification (email magique
      + Google), layout + sidebar avec arborescence de pages, CRUD de pages
      (création, renommage, suppression douce), autosave.
- [ ] Jalon 2 — Éditeur par blocs (TipTap)
- [ ] Jalon 3 — Imbrication avancée, drag & drop, corbeille, favoris, fil d'Ariane
- [ ] Jalon 4 — Bases de données (vues Table/Board/Liste/Calendrier, filtres, tris)
- [ ] Jalon 5 — Recherche, mentions, backlinks
- [ ] Jalon 6 — Partage, rôles, lien public
- [ ] Jalon 7 — Temps réel (Yjs)
- [ ] Jalon 8 — Finition (perf, accessibilité, états vides/chargement)

## Modèle de données : ordre et imbrication

- **Arborescence des pages** (sidebar) : liste à parent pointé (`Page.parentId`)
  + index fractionné (`Page.position`, package `fractional-indexing`) pour
  l'ordre entre pages sœurs. Déplacer une page ne réécrit que la position de
  cette page — jamais celle de ses voisines — donc un déplacement reste en
  O(1) quelle que soit la taille de la liste. Contrepartie : les positions
  sont des chaînes comparées lexicographiquement plutôt que des entiers, et
  des insertions répétées au même endroit peuvent les faire grandir (pas un
  problème à cette échelle ; un rééquilibrage périodique resterait possible).
- **Blocs à l'intérieur d'une page** : *pas* de table séparée. TipTap possède
  un unique document ProseMirror par page, persisté tel quel dans
  `Page.content` (JSON). L'arbre de nœuds ProseMirror **est** déjà l'arbre de
  blocs matérialisé : imbrication, ordre, glisser-déposer et indentation sont
  des opérations que l'éditeur fournit nativement via ses transactions.
  Réimplémenter cela comme des lignes plates avec pointeurs de parent irait à
  l'encontre de la bibliothèque sans bénéfice de requête ici (la recherche et
  les backlinks s'appuient sur `Page.plainText`, extrait du JSON à
  l'enregistrement).

## Prérequis

- Node.js 20.19+ (testé avec Node 25)
- pnpm (`npm install -g pnpm`)
- Docker (pour PostgreSQL en local), ou une instance PostgreSQL existante

## Installation

```bash
pnpm install
cp .env.example .env
# éditer .env si besoin (Google OAuth, SMTP...)

docker compose up -d      # démarre PostgreSQL sur localhost:5432
pnpm exec prisma migrate dev
```

## Variables d'environnement

Voir `.env.example`. En résumé :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL |
| `AUTH_SECRET` | Secret Auth.js (`openssl rand -base64 32`) |
| `AUTH_URL` | URL publique de l'app (dev : `http://localhost:3000`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Identifiants OAuth Google (optionnel en dev) |
| `EMAIL_FROM`, `EMAIL_SERVER_*` | SMTP pour l'envoi du lien de connexion |

**Connexion par e-mail sans SMTP configuré** : en développement, si
`EMAIL_SERVER_HOST` est vide, le lien de connexion n'est pas envoyé par
e-mail mais affiché dans la console du serveur (`pnpm dev`), ce qui permet de
tester le parcours de bout en bout sans service SMTP.

**Google OAuth** : créez des identifiants sur la
[Google Cloud Console](https://console.cloud.google.com/apis/credentials)
avec comme URI de redirection `http://localhost:3000/api/auth/callback/google`.

## Lancement

```bash
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). La première connexion
provisionne automatiquement un espace de travail personnel avec une page de
bienvenue.

## Migrations

```bash
pnpm exec prisma migrate dev --name <description>   # nouvelle migration en dev
pnpm exec prisma migrate deploy                       # application en production
pnpm exec prisma generate                             # régénérer le client (fait automatiquement par migrate)
```

Le client Prisma est généré dans `src/generated/prisma` (ignoré par git).

## Qualité

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm build       # build de production
```
