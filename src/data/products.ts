// src/data/products.ts

export const productsData: Record<string, any> = {
    pupsiko: {
        id: "pupsiko",
        title: "Pupsiko",
        description: "Detailed description of the Pupsiko project. Awesome Magic Bee Boop Crazy Stuff. Loading Cmon Boom Bang. Lets do it.",
        year: "2024",
        role: "Design & 3D",
        photos: [
            '/product/Image1.png',
            '/product/Image2.png',
            '/product/Image3.png',
            '/product/image4.png',
            '/product/image5.png',
            '/product/image6.png',
        ]
    },
    memo: {
        id: "memo",
        title: "Memo",
        description: "This is the Memo project. A completely different description for a different product.",
        year: "2023",
        role: "UX/UI Design",
        photos: [
            '/product/Image2.png',
            '/product/Image3.png',
            '/product/image4.png',
        ]
    },
    // Сюда потом будешь добавлять новые товары, просто копируя блок выше
};