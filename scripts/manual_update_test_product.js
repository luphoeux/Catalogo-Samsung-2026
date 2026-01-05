// Manual update for testing - Add this to browser console on admin panel

// Product data for AR09TSEAAWK/ZS
const productUpdate = {
  colors: [
    {
      id: "c007",
      colorId: "c007", 
      name: "Blanco",
      hex: "#f5f7f6",
      sku: "AR09TSEAAWK/ZS",
      images: ["https://samsung-bolivia.s3.amazonaws.com/product-family-item-image/normal/product-family-item-image_6x183S5dUuNs24atOlfL.png"],
      image: "https://samsung-bolivia.s3.amazonaws.com/product-family-item-image/normal/product-family-item-image_6x183S5dUuNs24atOlfL.png"
    }
  ]
};

// Instructions:
// 1. Go to http://localhost:5000/admin/products.html
// 2. Find "Split wind-free, inverter, 9000 btu" product
// 3. Click Edit
// 4. In Color section:
//    - Select "Blanco" from dropdown
//    - Enter SKU: AR09TSEAAWK/ZS
//    - Click "Agregar otra imagen"
//    - Paste: https://samsung-bolivia.s3.amazonaws.com/product-family-item-image/normal/product-family-item-image_6x183S5dUuNs24atOlfL.png
// 5. Click Save

console.log('Product update data ready:', productUpdate);
