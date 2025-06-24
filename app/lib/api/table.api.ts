// src/lib/api/table.api.ts
import type { NewTableData, Table, UpdateTableData } from "@/app/types/strapi";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';



/**
 * Yeni bir masa oluşturur.
 */
export async function createTable(tableData: NewTableData, jwt: string): Promise<Table> {
    // Strapi'de modelimizin API ID'si 'masa' olduğu için endpoint 'masas' olur.
    const createUrl = `${STRAPI_URL}/api/tables`;

    try {
        const res = await fetch(createUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ data: tableData }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error?.message || 'Masa oluşturulamadı.');
        }
        return data.data;
    } catch (error) {
        console.error("Error in createTable:", error);
        throw error;
    }
}

/**
 * Mevcut bir masayı günceller.
 */
export async function updateTable(id: number, tableData: UpdateTableData, jwt: string): Promise<Table> {
    const updateUrl = `${STRAPI_URL}/api/tables/${id}/custom-update`;

    try {
        const res = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ data: tableData }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error?.message || 'Masa güncellenemedi.');
        }
        return data.data;
    } catch (error) {
        console.error("Error in updateTable:", error);
        throw error;
    }
}

/**
 * Mevcut bir masayı güvenli bir şekilde siler.
 */
export async function deleteTable(id: number, jwt: string): Promise<any> {
    const deleteUrl = `${STRAPI_URL}/api/tables/${id}/safe-delete`;
    try {
        const res = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error?.message || 'Masa silinemedi.');
        }
        return data.data;
    } catch (error) {
        console.error("Error in deleteTable:", error);
        throw error;
    }
}

