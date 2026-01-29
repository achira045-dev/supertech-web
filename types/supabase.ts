export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            addresses: {
                Row: {
                    address: string | null
                    created_at: string
                    district: string | null
                    id: number
                    is_default: boolean | null
                    phone: string | null
                    province: string | null
                    recipient_name: string | null
                    user_id: string
                    zipcode: string | null
                }
                Insert: {
                    address?: string | null
                    created_at?: string
                    district?: string | null
                    id?: number
                    is_default?: boolean | null
                    phone?: string | null
                    province?: string | null
                    recipient_name?: string | null
                    user_id: string
                    zipcode?: string | null
                }
                Update: {
                    address?: string | null
                    created_at?: string
                    district?: string | null
                    id?: number
                    is_default?: boolean | null
                    phone?: string | null
                    province?: string | null
                    recipient_name?: string | null
                    user_id?: string
                    zipcode?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "addresses_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            order_items: {
                Row: {
                    id: number
                    order_id: number | null
                    price_at_purchase: number | null
                    product_id: number | null
                    quantity: number | null
                }
                Insert: {
                    id?: number
                    order_id?: number | null
                    price_at_purchase?: number | null
                    product_id?: number | null
                    quantity?: number | null
                }
                Update: {
                    id?: number
                    order_id?: number | null
                    price_at_purchase?: number | null
                    product_id?: number | null
                    quantity?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    cancel_reason: string | null
                    created_at: string
                    id: number
                    payment_method: string | null
                    slip_url: string | null
                    status: string | null
                    total_amount: number | null
                    user_id: string
                }
                Insert: {
                    cancel_reason?: string | null
                    created_at?: string
                    id?: number
                    payment_method?: string | null
                    slip_url?: string | null
                    status?: string | null
                    total_amount?: number | null
                    user_id: string
                }
                Update: {
                    cancel_reason?: string | null
                    created_at?: string
                    id?: number
                    payment_method?: string | null
                    slip_url?: string | null
                    status?: string | null
                    total_amount?: number | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    category: string | null
                    created_at: string
                    description: string | null
                    id: number
                    image_url: string | null
                    name: string | null
                    price: number | null
                    stock: number | null
                }
                Insert: {
                    category?: string | null
                    created_at?: string
                    description?: string | null
                    id?: number
                    image_url?: string | null
                    name?: string | null
                    price?: number | null
                    stock?: number | null
                }
                Update: {
                    category?: string | null
                    created_at?: string
                    description?: string | null
                    id?: number
                    image_url?: string | null
                    name?: string | null
                    price?: number | null
                    stock?: number | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    address: string | null
                    avatar_url: string | null
                    birth_date: string | null
                    created_at: string
                    email: string | null
                    facebook: string | null
                    full_name: string | null
                    id: string
                    instagram: string | null
                    line_id: string | null
                    phone: string | null
                    role: string | null
                    updated_at: string | null
                }
                Insert: {
                    address?: string | null
                    avatar_url?: string | null
                    birth_date?: string | null
                    created_at?: string
                    email?: string | null
                    facebook?: string | null
                    full_name?: string | null
                    id: string
                    instagram?: string | null
                    line_id?: string | null
                    phone?: string | null
                    role?: string | null
                    updated_at?: string | null
                }
                Update: {
                    address?: string | null
                    avatar_url?: string | null
                    birth_date?: string | null
                    created_at?: string
                    email?: string | null
                    facebook?: string | null
                    full_name?: string | null
                    id?: string
                    instagram?: string | null
                    line_id?: string | null
                    phone?: string | null
                    role?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            reviews: {
                Row: {
                    comment: string | null
                    created_at: string
                    id: number
                    product_id: number
                    rating: number | null
                    user_id: string
                }
                Insert: {
                    comment?: string | null
                    created_at?: string
                    id?: number
                    product_id: number
                    rating?: number | null
                    user_id: string
                }
                Update: {
                    comment?: string | null
                    created_at?: string
                    id?: number
                    product_id?: number
                    rating?: number | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "reviews_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
