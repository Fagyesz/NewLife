
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: false,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/fooldal"
  },
  {
    "renderMode": 2,
    "route": "/esemenyek"
  },
  {
    "renderMode": 2,
    "route": "/hirek"
  },
  {
    "renderMode": 2,
    "route": "/elo-kozvetites"
  },
  {
    "renderMode": 2,
    "route": "/rolunk"
  },
  {
    "renderMode": 2,
    "route": "/kapcsolat"
  },
  {
    "renderMode": 2,
    "route": "/admin"
  },
  {
    "renderMode": 2,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 511, hash: '3c8e5f40568cd0d4b436579f6d5c9d95b2839ac1abf018b5506014f5f203964e', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1051, hash: 'f46dc4865d84400dba33e2abae19a985ba20b32bf5108028c43b259f9eaabc28', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'kapcsolat/index.html': {size: 40852, hash: 'fadbe868934c8d7a44d7efe9a67e4c0d118690bd5c7eb30ec1049dc59cb8b760', text: () => import('./assets-chunks/kapcsolat_index_html.mjs').then(m => m.default)},
    'rolunk/index.html': {size: 36960, hash: 'e170d79bcbb8a6ff0d249b169785bc4d3d2fe3cf1a7d5c461a963802ed198cb1', text: () => import('./assets-chunks/rolunk_index_html.mjs').then(m => m.default)},
    'elo-kozvetites/index.html': {size: 38790, hash: '314a4408426617f7e735a23942d6481eebd4c39435cf95562403755bcb4f747c', text: () => import('./assets-chunks/elo-kozvetites_index_html.mjs').then(m => m.default)},
    'index.html': {size: 31802, hash: '0b3a95416a42aab9b6fabae52e69e06fe69acd3a882ee1a3e2741f898ab9ce45', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'hirek/index.html': {size: 28581, hash: 'a9aef4f45581bc71031dfba697df13d2a5d386c45a753f06e9b7dd16669f460f', text: () => import('./assets-chunks/hirek_index_html.mjs').then(m => m.default)},
    'fooldal/index.html': {size: 31808, hash: 'f5ad65bc527acd8850ca1dbb347edf6cd14c933eb2110c11fc4be4d3eafc59a2', text: () => import('./assets-chunks/fooldal_index_html.mjs').then(m => m.default)},
    'esemenyek/index.html': {size: 26138, hash: '8d16d6c7de7afced50800d43b9d4403e0b69402412c9777ba8ad42e14522a43a', text: () => import('./assets-chunks/esemenyek_index_html.mjs').then(m => m.default)},
    'admin/index.html': {size: 31802, hash: 'ebf8c3a90c67ce03b84e315f60cf89f346d78fc4b73ff2e882669f1683dd53bd', text: () => import('./assets-chunks/admin_index_html.mjs').then(m => m.default)}
  },
};
