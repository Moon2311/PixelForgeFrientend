// Static storefront merchandising content (categories + imagery).
// Product data itself comes from the products API.

const unsplash = (id, w = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${w}&q=70`

export const CATEGORIES = [
  { label: 'Smartphones', image: unsplash('photo-1511707171634-5f897ff02aa9') },
  { label: 'Laptops', image: unsplash('photo-1496181133206-80ce9b88a853') },
  { label: 'Tablets', image: unsplash('photo-1544244015-0df4b3ffc6b0') },
  { label: 'Audio', image: unsplash('photo-1505740420928-5e560c06d30e') },
  { label: 'Wearables', image: unsplash('photo-1523275335684-37898b6baf30') },
  { label: 'Cameras', image: unsplash('photo-1516035069371-29a1b244cc32') },
  { label: 'Gaming', image: unsplash('photo-1606144042614-b2417e99c4e3') },
  { label: 'TV & Home', image: unsplash('photo-1593359677879-a4bb92f829d1') },
]

export const categoryImage = (label) =>
  CATEGORIES.find((c) => c.label === label)?.image
