'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type Product = {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    category: string;
    brand?: string; // Added brand
    image: string;
    description: string;
    images?: string[];
    sold?: string;
};

type ProductContextType = {
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
    updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<boolean>;
    loading: boolean;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*, brands(name)') // Fetch brand name
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products:', error);
                return;
            }

            if (data) {
                const mappedProducts: Product[] = data.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                    price: Number(item.price), // Ensure number
                    originalPrice: item.original_price ? Number(item.original_price) : Number(item.price), // Map from DB
                    discount: item.discount || '', // Map from DB
                    category: item.category || 'General',
                    brand: item.brands?.name || '', // Map Brand
                    image: item.image_url || '',
                    description: item.description || '',
                    images: item.image_url ? [item.image_url] : [],
                    sold: '0'
                }));
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error('Unexpected error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addProduct = async (product: Omit<Product, 'id'>): Promise<boolean> => {
        try {
            // 1. Validate inputs
            if (!product.name || product.price === undefined || product.price === null) {
                alert('กรุณากรอกชื่อสินค้าและราคา');
                return false;
            }

            // Calculate discount if originalPrice is provided and greater than price
            let discountString = '';
            let originalPriceVal = Number(product.originalPrice) || Number(product.price);

            if (originalPriceVal > product.price) {
                const diff = originalPriceVal - product.price;
                const percent = Math.round((diff / originalPriceVal) * 100);
                if (percent > 0) discountString = `-${percent}%`;
            } else {
                // If price >= originalPrice, then no discount. Reset originalPrice to price to stay consistent
                originalPriceVal = Number(product.price);
            }

            // 2. Prepare Payload (Normal trimming)
            const payload = {
                name: product.name.trim(),
                price: Number(product.price),
                original_price: originalPriceVal,
                discount: discountString,
                category: product.category?.trim() || 'General',
                image_url: product.image?.trim() || '',
                description: product.description?.trim() || '',
                stock: 0
            };

            // 3. Insert and Select to get ID
            const { data, error } = await supabase
                .from('products')
                .insert([payload])
                .select('*, brands(name)') // Select brand too if possible, usually null for new unless triggered
                .single();

            if (error) {
                console.error('Supabase Error:', error);
                alert(`เกิดข้อผิดพลาด: ${error.message}`);
                return false;
            }

            // 4. Update Local State (No Refetch)
            if (data) {
                const newProduct: Product = {
                    id: data.id.toString(),
                    name: data.name || '',
                    price: Number(data.price),
                    originalPrice: Number(data.original_price),
                    discount: data.discount || '',
                    category: data.category || 'General',
                    brand: data.brands?.name || '',
                    image: data.image_url || '',
                    description: data.description || '',
                    images: data.image_url ? [data.image_url] : [],
                    sold: '0'
                };
                setProducts(prev => [newProduct, ...prev]);
            }

            return true;
        } catch (err: any) {
            console.error('Unexpected Error:', err);
            alert('เกิดข้อผิดพลาดที่ไม่คาดคิด: ' + (err.message || err));
            return false;
        }
    };

    const updateProduct = async (id: string, updatedProduct: Partial<Product>): Promise<boolean> => {
        try {
            const updates: any = {};
            if (updatedProduct.name !== undefined) updates.name = updatedProduct.name;
            if (updatedProduct.price !== undefined) updates.price = updatedProduct.price;
            if (updatedProduct.category !== undefined) updates.category = updatedProduct.category;
            if (updatedProduct.image !== undefined) updates.image_url = updatedProduct.image;
            if (updatedProduct.description !== undefined) updates.description = updatedProduct.description;

            // Handle Price & Discount Logic for Update
            if (updatedProduct.price !== undefined || updatedProduct.originalPrice !== undefined) {
                // We need potentially both new price and new originalPrice to calc discount correctly
                // However, we might only have one of them in 'updatedProduct'. 
                // We'd ideally need current state to do this perfectly on client side before sending, 
                // or just send what we have. 
                // For simplicity, let's assume the UI sends both or we use what's passed.

                // If UI sends both (which Admin Dashboard will), calculate.
                if (updatedProduct.price !== undefined && updatedProduct.originalPrice !== undefined) {
                    let op = Number(updatedProduct.originalPrice);
                    let p = Number(updatedProduct.price);

                    if (op > p) {
                        const percent = Math.round(((op - p) / op) * 100);
                        updates.discount = `-${percent}%`;
                        updates.original_price = op;
                    } else {
                        updates.discount = '';
                        updates.original_price = p; // Reset original to current if no discount
                    }
                } else if (updatedProduct.price !== undefined) {
                    // Only price changed. We should probably reset discount unless we fetch originalPrice.
                    // A safe bet for partial update without extra read is to just update price. 
                    // But user requirement implies auto-calc.
                    // The AdminModal will likely send both. Let's handle just 'original_price' mapping.
                }
            }

            // Direct mapping if passed explicitly
            if (updatedProduct.originalPrice !== undefined) updates.original_price = updatedProduct.originalPrice;
            if (updatedProduct.discount !== undefined) updates.discount = updatedProduct.discount;


            const { data, error } = await supabase
                .from('products')
                .update(updates as any)
                .eq('id', Number(id))
                .select()
                .single();

            if (error) throw error;

            // Update Local State
            if (data) {
                setProducts(prev => prev.map(p => {
                    if (p.id === id) {
                        return {
                            ...p,
                            name: data.name || '',
                            price: Number(data.price),
                            originalPrice: Number(data.original_price), // Update
                            discount: data.discount, // Update
                            category: data.category || 'General',
                            image: data.image_url || '',
                            description: data.description || '',
                            images: data.image_url ? [data.image_url] : [],
                        };
                    }
                    return p;
                }));
            }
            return true;
        } catch (error) {
            console.error('Error updating product:', error);
            alert('ล้มเหลวในการแก้ไขสินค้า: ' + (error as any).message);
            return false;
        }
    };

    const deleteProduct = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', Number(id));

            if (error) throw error;

            // Update Local State
            setProducts(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('ล้มเหลวในการลบสินค้า: ' + (error as any).message);
            return false;
        }
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}
