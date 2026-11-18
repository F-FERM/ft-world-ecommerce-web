export class LocalStorage {
    static isServer = () => typeof window === "undefined";

    static setItem = (key: string, value: string | boolean) => {
        const stringValue =
            typeof value === "boolean" ? JSON.stringify(value) : value;
        return !LocalStorage.isServer() && localStorage.setItem(key, stringValue);
    };

    static getItem = (key: string) => {
        return !LocalStorage.isServer() && localStorage.getItem(key);
    };

    static clear = () => {
        return !LocalStorage.isServer() && localStorage.clear();
    };
    static removeItem = (key: string) => {
        return !LocalStorage.isServer() && localStorage.removeItem(key);
    };
}

/* ------------------------------------------------------------------ */
/*  Separate token keys — never share between admin and customer       */
/* ------------------------------------------------------------------ */
export const TOKEN_KEYS = {
    admin: "admin_access_token",
    customer: "customer_access_token",
} as const;

/* ------------------------------------------------------------------ */
/*  Guest cart (localStorage) helpers                                  */
/* ------------------------------------------------------------------ */
export const GUEST_CART_KEY = "guest_cart";

export interface GuestCartItem {
    productId: string;
    quantity: number;
    /** Display title */
    name?: string;
    /** Selling price */
    price?: number;
    /** Original / compare-at price (shown with strikethrough) */
    compareAtPrice?: number;
    /** Compatible label e.g. "COMPATIBLE FOR CANON IR:" */
    compatibleWith?: string;
    /** Compatible model numbers */
    compatibleModels?: string;
    /** Product image URL */
    image?: string;
    /** Max stock available */
    stock?: number;
}

export const guestCart = {
    get(): GuestCartItem[] {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(localStorage.getItem(GUEST_CART_KEY) ?? "[]");
        } catch {
            return [];
        }
    },
    save(items: GuestCartItem[]) {
        if (typeof window === "undefined") return;
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    },
    add(item: GuestCartItem) {
        const items = guestCart.get();
        const idx = items.findIndex((i) => i.productId === item.productId);
        if (idx >= 0) {
            items[idx].quantity += item.quantity ?? 1;
        } else {
            items.push({ ...item, quantity: item.quantity ?? 1 });
        }
        guestCart.save(items);
        return items;
    },
    remove(productId: string) {
        const items = guestCart.get().filter((i) => i.productId !== productId);
        guestCart.save(items);
        return items;
    },
    update(productId: string, quantity: number) {
        const items = guestCart.get().map((i) =>
            i.productId === productId ? { ...i, quantity } : i
        );
        guestCart.save(items);
        return items;
    },
    clear() {
        if (typeof window !== "undefined") localStorage.removeItem(GUEST_CART_KEY);
    },
    count(): number {
        return guestCart.get().reduce((sum, i) => sum + i.quantity, 0);
    },
};
