import { beforeEach, describe, expect, it } from "vitest";
import { addToCart, clearCart, getCartItems, updateQuantity } from "../lib/cart-store";

describe("local mock cart", () => {
  beforeEach(() => clearCart());

  it("adds items and merges repeated product quantities", () => {
    addToCart({ id: "a5", name: "A5", detail: "15 × 21 سم", price: 18 });
    addToCart({ id: "a5", name: "A5", detail: "15 × 21 سم", price: 18 });
    expect(getCartItems()).toHaveLength(1);
    expect(getCartItems()[0].quantity).toBe(2);
  });

  it("updates quantity and removes the item at zero", () => {
    addToCart({ id: "canvas", name: "Canvas", detail: "30 × 30 سم", price: 119 });
    updateQuantity("canvas", 3);
    expect(getCartItems()[0].quantity).toBe(3);
    updateQuantity("canvas", 0);
    expect(getCartItems()).toHaveLength(0);
  });
});
