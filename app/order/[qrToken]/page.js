"use client";

import { useEffect, useMemo, useState } from "react";

function formatMoney(value) {
  return `Rs ${Number(value || 0).toFixed(0)}`;
}

function statusTone(status) {
  if (status === "ready") return "bg-emerald-100 text-emerald-700";
  if (status === "preparing") return "bg-amber-100 text-amber-700";
  if (status === "pending") return "bg-slate-200 text-slate-700";
  return "bg-slate-200 text-slate-700";
}

export default function CustomerOrderPage({ params }) {
  const [session, setSession] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [statusFeed, setStatusFeed] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("menu");
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailNote, setDetailNote] = useState("");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [openSubcategoryId, setOpenSubcategoryId] = useState("");
  const [search, setSearch] = useState("");
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://u133olebmptuq5bymoqwxnrr.103.108.220.202.sslip.io";

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0),
    [cart]
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.qty), 0),
    [cart]
  );

  useEffect(() => {
    let sock;

    const run = async () => {
      try {
        const { io } = await import("socket.io-client");
        setLoading(true);
        setError("");
        const sessionResponse = await fetch(`/api/session/${params.qrToken}`);
        const sessionJson = await sessionResponse.json();
        if (!sessionResponse.ok) throw new Error(sessionJson.error || "Unable to start your table session");

        setSession(sessionJson);

        const menuResponse = await fetch(`/api/menu/${sessionJson.restaurant.id}`);
        const menuJson = await menuResponse.json();
        if (!menuResponse.ok) throw new Error(menuJson.error || "Unable to load menu");

        setMenu(menuJson.categories || []);
        setCurrentCategoryIndex(0);
        const firstCategory = (menuJson.categories || []).find(
          (category) => (category.subcategories || []).length > 0 || (category.items || []).length > 0
        );
        const firstSubcategory = firstCategory?.subcategories?.[0];
        setOpenSubcategoryId(firstSubcategory?._id || "");

        sock = io(socketUrl, { reconnection: true });
        sock.on("connect", () => sock.emit("join_table", { tableId: sessionJson.table.id }));
        sock.on("order_status", (payload) => {
          setStatusFeed((prev) => [{ at: new Date().toISOString(), ...payload }, ...prev].slice(0, 10));
        });
      } catch (runError) {
        setError(runError.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => {
      if (sock) sock.disconnect();
    };
  }, [params.qrToken, socketUrl]);

  const orderedMenu = useMemo(
    () =>
      menu
        .filter((category) => (category.subcategories || []).length > 0 || (category.items || []).length > 0),
    [menu]
  );

  const currentCategory = orderedMenu[currentCategoryIndex] || null;
  const currentSubcategories = useMemo(() => {
    if (!currentCategory) return [];
    if ((currentCategory.subcategories || []).length > 0) return currentCategory.subcategories;
    return [{ _id: `${currentCategory._id}-default`, name: currentCategory.name, items: currentCategory.items || [] }];
  }, [currentCategory]);
  const filteredSubcategories = useMemo(
    () =>
      currentSubcategories
        .map((subcategory) => ({
          ...subcategory,
          filteredItems: (subcategory.items || []).filter((item) =>
            [item.name, item.description]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase())
          ),
        }))
        .filter((subcategory) => (subcategory.filteredItems || []).length > 0 || !search.trim()),
    [currentSubcategories, search]
  );

  function addItem(item, qty = 1, note = "") {
    setCart((prev) => {
      const existingIndex = prev.findIndex((row) => row.menuItemId === item._id);
      if (existingIndex === -1) {
        return [
          ...prev,
          {
            menuItemId: item._id,
            kitchenId: item.kitchenId,
            name: item.name,
            price: item.price,
            qty,
            note,
            image: item.image || "",
          },
        ];
      }
      const next = [...prev];
      next[existingIndex] = {
        ...next[existingIndex],
        qty: next[existingIndex].qty + qty,
        note: note || next[existingIndex].note,
      };
      return next;
    });
  }

  function updateQty(menuItemId, delta) {
    setCart((prev) =>
      prev
        .map((row) => (row.menuItemId === menuItemId ? { ...row, qty: row.qty + delta } : row))
        .filter((row) => row.qty > 0)
    );
  }

  async function placeOrder() {
    if (!session || cart.length === 0) return;
    setPlacing(true);
    setNotice("");
    setError("");

    const payload = {
      restaurantId: session.restaurant.id,
      tableId: session.table.id,
      sessionId: session.sessionId,
      items: cart.map((item) => ({
        menuItemId: item.menuItemId,
        kitchenId: item.kitchenId,
        qty: item.qty,
        note: item.note || "",
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to place order");
      }

      setCart([]);
      setNotice("Your order has been sent to the kitchen.");
      setView("status");
    } catch (placeError) {
      setError(placeError.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  function openItemDetail(item) {
    setSelectedItem(item);
    setDetailQty(1);
    setDetailNote("");
    setView("detail");
  }

  function addFromDetail() {
    if (!selectedItem) return;
    addItem(selectedItem, detailQty, detailNote);
    setNotice(`${selectedItem.name} added to your cart`);
    setView("menu");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdf2e4,_#f6efe5_45%,_#efe5d5_100%)] text-[#221d17]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-32 pt-4">
        <section className="overflow-hidden rounded-[32px] bg-[#221d17] px-5 py-5 text-white shadow-[0_24px_80px_rgba(34,29,23,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f1c79e]">
                QR Table Dining
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight">
                {session?.restaurant?.name || "Preparing your table"}
              </h1>
              <p className="mt-2 text-sm text-[#dfd1bf]">
                {session?.table?.name ? `You're ordering for ${session.table.name}.` : "Starting your table session."}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-[#f9ead9]">
              Live
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#f1c79e]">Cart</p>
              <p className="mt-2 text-xl font-semibold">{cartCount}</p>
              <p className="text-xs text-[#dfd1bf]">items ready</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#f1c79e]">Total</p>
              <p className="mt-2 text-xl font-semibold">{formatMoney(total)}</p>
              <p className="text-xs text-[#dfd1bf]">current basket</p>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="mt-4 rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-[#6f665c]">Loading your menu...</p>
          </section>
        ) : null}

        {error ? (
          <section className="mt-4 rounded-[28px] border border-[#efc9bf] bg-[#fff4f1] p-5 text-sm text-[#8e402c] shadow-sm">
            {error}
          </section>
        ) : null}

        {notice ? (
          <section className="mt-4 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {notice}
          </section>
        ) : null}

        {statusFeed.length > 0 ? (
          <section className="mt-4 rounded-[28px] border border-white/60 bg-white/85 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9d6b3d]">
                  Latest Update
                </p>
                <p className="mt-1 text-sm text-[#5e554a]">
                  Order #{statusFeed[0].orderId?.slice(-6)} is now{" "}
                  <span className="font-semibold capitalize text-[#221d17]">{statusFeed[0].status}</span>
                </p>
              </div>
              <button
                className="rounded-full bg-[#f5ebe0] px-3 py-2 text-xs font-semibold text-[#8c5d30]"
                onClick={() => setView("status")}
              >
                View feed
              </button>
            </div>
          </section>
        ) : null}

        {view === "menu" ? (
          <>
            <section className="mt-5 rounded-[30px] border border-white/60 bg-white/85 p-4 shadow-sm backdrop-blur">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9d6b3d]">
                    Browse Menu
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">Pick your next craving</h2>
                </div>
                <p className="text-sm text-[#73695e]">{orderedMenu.length} categories</p>
              </div>

              <div className="mt-4">
                <input
                  className="w-full rounded-2xl border border-[#eadccb] bg-[#f9f4ec] px-4 py-3 text-sm outline-none transition focus:border-[#cf7a36]"
                  placeholder={currentCategory ? `Search ${currentCategory.name}` : "Search menu items"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {orderedMenu.map((category, idx) => (
                  <button
                    key={category._id}
                    className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition ${
                      idx === currentCategoryIndex
                        ? "bg-[#221d17] text-white shadow-sm"
                        : "bg-[#f3eadf] text-[#5e554a]"
                    }`}
                    onClick={() => {
                      setCurrentCategoryIndex(idx);
                      const nextCategory = orderedMenu[idx];
                      const nextSubcategories =
                        (nextCategory?.subcategories || []).length > 0
                          ? nextCategory.subcategories
                          : [{ _id: `${nextCategory?._id}-default`, name: nextCategory?.name, items: nextCategory?.items || [] }];
                      setOpenSubcategoryId(nextSubcategories[0]?._id || "");
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4 space-y-3">
              {currentCategory ? (
                filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map((subcategory) => {
                    const isOpen = openSubcategoryId === subcategory._id;
                    return (
                      <article key={subcategory._id} className="rounded-[28px] border border-white/60 bg-white/90 p-3 shadow-sm backdrop-blur">
                        <button
                          className="flex w-full items-center justify-between gap-3 rounded-[20px] px-1 py-1 text-left"
                          onClick={() => setOpenSubcategoryId((prev) => (prev === subcategory._id ? "" : subcategory._id))}
                        >
                          <div>
                            <h3 className="text-base font-semibold text-[#221d17]">{subcategory.name}</h3>
                            <p className="mt-1 text-sm text-[#6f665c]">{subcategory.filteredItems.length} items</p>
                          </div>
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8efe4] text-xl font-semibold text-[#c96a2b]">
                            {isOpen ? "-" : "+"}
                          </span>
                        </button>

                        {isOpen ? (
                          <div className="mt-3 space-y-3">
                            {subcategory.filteredItems.map((item) => {
                              const currentCartRow = cart.find((row) => row.menuItemId === item._id);
                              return (
                                <div
                                  key={item._id}
                                  className="overflow-hidden rounded-[24px] border border-[#efe4d6] bg-[#fbf7f0] p-3"
                                >
                                  <div className="flex gap-3">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-24 w-24 rounded-[22px] object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-24 w-24 items-center justify-center rounded-[22px] bg-[#f8e0cb] text-2xl font-semibold text-[#c96a2b]">
                                        {item.name?.[0] || "F"}
                                      </div>
                                    )}

                                    <div className="flex min-w-0 flex-1 flex-col">
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <h4 className="text-base font-semibold text-[#221d17]">{item.name}</h4>
                                          <p className="mt-1 line-clamp-2 text-sm text-[#6f665c]">
                                            {item.description || "Made fresh and served to your table."}
                                          </p>
                                        </div>
                                        {currentCartRow ? (
                                          <span className="rounded-full bg-[#edf6ec] px-3 py-1 text-[11px] font-semibold text-emerald-700">
                                            x{currentCartRow.qty} in cart
                                          </span>
                                        ) : null}
                                      </div>

                                      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                                        <div>
                                          <p className="text-xs uppercase tracking-[0.22em] text-[#a28668]">
                                            Price
                                          </p>
                                          <p className="mt-1 text-lg font-semibold text-[#c96a2b]">
                                            {formatMoney(item.price)}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            className="rounded-full border border-[#eadccb] bg-[#faf4ed] px-3 py-2 text-xs font-semibold text-[#6c5b47]"
                                            onClick={() => openItemDetail(item)}
                                          >
                                            Details
                                          </button>
                                          <button
                                            className="rounded-full bg-[#c96a2b] px-4 py-2 text-xs font-semibold text-white"
                                            onClick={() => addItem(item)}
                                          >
                                            Add now
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-[28px] border border-white/60 bg-white/90 p-5 text-sm text-[#6f665c] shadow-sm">
                    No items match this search in {currentCategory.name}.
                  </div>
                )
              ) : (
                <div className="rounded-[28px] border border-white/60 bg-white/90 p-5 text-sm text-[#6f665c] shadow-sm">
                  No menu categories are available right now.
                </div>
              )}
            </section>
          </>
        ) : null}

        {view === "detail" && selectedItem ? (
          <section className="mt-5 rounded-[32px] border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur">
            {selectedItem.image ? (
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="h-60 w-full rounded-[26px] object-cover"
              />
            ) : (
              <div className="flex h-60 w-full items-center justify-center rounded-[26px] bg-[#f8e0cb] text-6xl font-semibold text-[#c96a2b]">
                {selectedItem.name?.[0] || "F"}
              </div>
            )}

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9d6b3d]">
                  Customise
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#221d17]">
                  {selectedItem.name}
                </h2>
              </div>
              <p className="text-lg font-semibold text-[#c96a2b]">
                {formatMoney(selectedItem.price)}
              </p>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#6f665c]">
              {selectedItem.description || "Freshly prepared and served to your table."}
            </p>

            <textarea
              className="mt-5 min-h-[110px] w-full rounded-[24px] border border-[#eadccb] bg-[#f9f4ec] px-4 py-3 text-sm outline-none transition focus:border-[#cf7a36]"
              placeholder="Special note for the kitchen? Optional."
              value={detailNote}
              onChange={(e) => setDetailNote(e.target.value)}
            />

            <div className="mt-5 flex items-center justify-between rounded-[24px] bg-[#f7efe4] px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d6b3d]">Quantity</p>
                <p className="mt-1 text-sm text-[#6f665c]">Adjust before adding</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddcfbe] bg-white text-lg"
                  onClick={() => setDetailQty((qty) => Math.max(1, qty - 1))}
                >
                  -
                </button>
                <span className="min-w-6 text-center text-lg font-semibold">{detailQty}</span>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#221d17] text-lg text-white"
                  onClick={() => setDetailQty((qty) => qty + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 rounded-full border border-[#eadccb] bg-[#fbf7f0] px-4 py-3 text-sm font-semibold text-[#5d5348]"
                onClick={() => setView("menu")}
              >
                Back
              </button>
              <button
                className="flex-1 rounded-full bg-[#c96a2b] px-4 py-3 text-sm font-semibold text-white"
                onClick={addFromDetail}
              >
                Add to cart
              </button>
            </div>
          </section>
        ) : null}

        {view === "cart" ? (
          <section className="mt-5 rounded-[32px] border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9d6b3d]">
                  Your Basket
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Ready to send</h2>
              </div>
              <p className="text-sm text-[#73695e]">{cartCount} items</p>
            </div>

            <div className="mt-5 space-y-3">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="rounded-[24px] border border-[#f0e5d7] bg-[#fbf7f0] p-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-[18px] object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#f8e0cb] font-semibold text-[#c96a2b]">
                          {item.name?.[0] || "F"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#221d17]">{item.name}</p>
                        <p className="mt-1 text-xs text-[#6f665c]">
                          {item.note || "No note added"}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#c96a2b]">
                          {formatMoney(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddcfbe] bg-white"
                          onClick={() => updateQty(item.menuItemId, -1)}
                        >
                          -
                        </button>
                        <span className="min-w-5 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#221d17] text-white"
                          onClick={() => updateQty(item.menuItemId, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#ddcfbe] bg-[#faf4ed] px-4 py-6 text-sm text-[#6f665c]">
                  Your cart is empty. Add dishes from the menu to start your order.
                </div>
              )}
            </div>

            <div className="mt-5 rounded-[24px] bg-[#221d17] p-4 text-white">
              <div className="flex items-center justify-between text-sm text-[#d9cab8]">
                <span>Sub-total</span>
                <span>{formatMoney(total)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>

            <button
              className="mt-5 w-full rounded-full bg-[#c96a2b] px-4 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!cart.length || placing}
              onClick={placeOrder}
            >
              {placing ? "Sending your order..." : "Send to kitchen"}
            </button>
          </section>
        ) : null}

        {view === "status" ? (
          <section className="mt-5 rounded-[32px] border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9d6b3d]">
                  Order Feed
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Live table updates</h2>
              </div>
              <p className="text-sm text-[#73695e]">{statusFeed.length} events</p>
            </div>

            <div className="mt-5 space-y-3">
              {statusFeed.length > 0 ? (
                statusFeed.map((entry, index) => (
                  <div
                    key={`${entry.orderId || "order"}-${entry.at}-${index}`}
                    className="flex items-start justify-between gap-3 rounded-[24px] border border-[#f0e5d7] bg-[#fbf7f0] p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#221d17]">
                        Order #{entry.orderId?.slice(-6)}
                      </p>
                      <p className="mt-1 text-xs text-[#6f665c]">
                        {new Date(entry.at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone(entry.status)}`}
                    >
                      {entry.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#ddcfbe] bg-[#faf4ed] px-4 py-6 text-sm text-[#6f665c]">
                  No live updates yet. Once an order is placed, kitchen status changes will appear here.
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>

      <nav className="fixed bottom-3 left-1/2 z-20 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full border border-white/60 bg-white/90 px-2 py-2 shadow-[0_20px_60px_rgba(44,31,17,0.18)] backdrop-blur">
        {[
          { id: "menu", label: "Menu" },
          { id: "cart", label: "Cart" },
          { id: "status", label: "Status" },
        ].map((item) => (
          <button
            key={item.id}
            className={`relative flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
              view === item.id ? "bg-[#221d17] text-white" : "text-[#6f665c]"
            }`}
            onClick={() => setView(item.id)}
          >
            {item.label}
            {item.id === "cart" && cartCount > 0 ? (
              <span className="absolute right-2 top-1 rounded-full bg-[#c96a2b] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </main>
  );
}
