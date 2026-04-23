// src/data/products.ts

export interface Product {
    id: string;
    folderId: string;
    title: string;
    price: string;
    description: string;
    galleryImagesCount: number;
    year: string;
    role: string;
    tags: string[]; // <-- Добавили массив хэштегов
}

export const products: Product[] = [
    {
        id: 'pupsiko',
        folderId: 'prod_01',
        title: 'Открытки',
        price: '2000 ₽',
        description: 'Коллекция открыток из 10 штук. Иллюстрации: Катя ну ёб твою мать.',
        galleryImagesCount: 5,
        year: '2024',
        role: 'UI/UX Design',
        tags: ['Открытки', 'Серебро'] // <-- Добавили нужные теги
    },
    {
        id: 'memo',
        folderId: 'prod_02',
        title: 'Memo',
        price: 'SOLD',
        description: 'Детальное описание продукта Memo.',
        galleryImagesCount: 4,
        year: '2024',
        role: 'UI/UX Design',
        tags: ['Постеры', 'Серебро'] // <-- Добавили теги
    },
    {
        id: 'third-product',
        folderId: 'prod_03',
        title: 'Приведение',
        price: 'SOLD',
        description: 'Описание',
        galleryImagesCount: 4,
        year: '2024',
        role: 'UI/UX Design',
        tags: ['Картины', 'Игрушки'] // <-- Добавили теги
    }
];

// Вспомогательная функция для получения продукта по ID
export const getProductById = (id: string) => {
    return products.find(p => p.id === id);
};

// Хелпер для получения пути к главному фото (для карточки)
export const getPreviewImagePath = (folderId: string) => {
    return `/product/${folderId}/main_${folderId}.png`;
};

// Хелпер для получения путей ко всем картинкам галереи
// Обрати внимание: имена файлов в твоих папках не идут по порядку с 1.
// Поэтому для автоматизации лучше переименовать их в image1.png, image2.png и т.д.
// Ниже приведен пример логики, если файлы переименованы по порядку.
export const getGalleryImagePaths = (folderId: string, count: number) => {
    const paths = [];
    for (let i = 1; i <= count; i++) {
        paths.push(`/product/${folderId}/image${i}.png`);
    }
    return paths;
};

// НОВЫЙ ХЕЛПЕР: собирает все уникальные теги из всех продуктов
export const getAllTags = () => {
    const tagsSet = new Set<string>();
    products.forEach(product => {
        // Убрали .toUpperCase()
        product.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
};