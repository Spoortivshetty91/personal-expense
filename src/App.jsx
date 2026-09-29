import React, { useMemo, useState } from "react";

import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  WalletCards,
  Target,
  Search,
  Plus,
  Download,
  Trash2,
  Pencil,
  X,
  Check,
  Moon,
  Sun,
  Settings,
  PieChart,
  TrendingUp,
  CalendarDays,
  Sparkles,
  CreditCard,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  CircleDollarSign,
} from "lucide-react";

/* =========================================================
   INITIAL TRANSACTIONS
========================================================= */

const initialTransactions = [
  {
    id: 1,
    title: "Salary",
    category: "Income",
    type: "income",
    amount: 65000,
    date: "2026-09-01",
    note: "Monthly salary",
  },
  {
    id: 2,
    title: "Apartment Rent",
    category: "Housing",
    type: "expense",
    amount: 18000,
    date: "2026-09-02",
    note: "September rent",
  },
  {
    id: 3,
    title: "Groceries",
    category: "Food",
    type: "expense",
    amount: 2450,
    date: "2026-09-04",
    note: "Weekly groceries",
  },
  {
    id: 4,
    title: "Uber Ride",
    category: "Transport",
    type: "expense",
    amount: 620,
    date: "2026-09-06",
    note: "Airport ride",
  },
  {
    id: 5,
    title: "Online Course",
    category: "Education",
    type: "expense",
    amount: 1299,
    date: "2026-09-08",
    note: "Development course",
  },
  {
    id: 6,
    title: "Freelance Design",
    category: "Income",
    type: "income",
    amount: 8500,
    date: "2026-09-10",
    note: "Side project",
  },
  {
    id: 7,
    title: "Restaurant",
    category: "Food",
    type: "expense",
    amount: 980,
    date: "2026-09-12",
    note: "Dinner",
  },
  {
    id: 8,
    title: "Electricity Bill",
    category: "Bills",
    type: "expense",
    amount: 1650,
    date: "2026-09-15",
    note: "Monthly bill",
  },
  {
    id: 9,
    title: "Gym Membership",
    category: "Health",
    type: "expense",
    amount: 999,
    date: "2026-09-18",
    note: "Monthly membership",
  },
];

/* =========================================================
   CATEGORY DATA
========================================================= */

const categoryMeta = {
  Housing: {
    icon: Home,
    cls: "violet",
  },

  Food: {
    icon: Utensils,
    cls: "orange",
  },

  Transport: {
    icon: Car,
    cls: "blue",
  },

  Education: {
    icon: GraduationCap,
    cls: "cyan",
  },

  Health: {
    icon: HeartPulse,
    cls: "pink",
  },

  Bills: {
    icon: CreditCard,
    cls: "yellow",
  },

  Shopping: {
    icon: ShoppingBag,
    cls: "purple",
  },

  Other: {
    icon: MoreHorizontal,
    cls: "slate",
  },
};

/* =========================================================
   CURRENCY
========================================================= */

const currency = (n) =>
  `₹${Number(n).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

/* =========================================================
   APP
========================================================= */

function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("finora-transactions");

      if (saved) {
        return JSON.parse(saved);
      }

      return initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [dark, setDark] = useState(true);

  const [page, setPage] = useState("dashboard");

  const [query, setQuery] = useState("");

  const [filter, setFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [editing, setEditing] = useState(null);

  const [budget, setBudget] = useState(30000);

  const [toast, setToast] = useState("");

  /* =======================================================
     SAVE TRANSACTIONS
  ======================================================= */

  const save = (next) => {
    setTransactions(next);

    localStorage.setItem(
      "finora-transactions",
      JSON.stringify(next)
    );
  };

  /* =======================================================
     TOTALS
  ======================================================= */

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  /* =======================================================
     ALL CATEGORY TOTALS
  ======================================================= */

  const categoryTotals = useMemo(() => {
    const map = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] =
          (map[t.category] || 0) + Number(t.amount);
      });

    return Object.entries(map).sort(
      (a, b) => b[1] - a[1]
    );
  }, [transactions]);

  /* =======================================================
     FILTERED TRANSACTIONS
  ======================================================= */

  const filtered = transactions
    .filter((t) => {
      const q = query.toLowerCase();

      const matchQ =
        !q ||
        `${t.title} ${t.category} ${t.note}`
          .toLowerCase()
          .includes(q);

      const matchF =
        filter === "All" ||
        (filter === "Income" && t.type === "income") ||
        (filter === "Expenses" && t.type === "expense") ||
        (!["All", "Income", "Expenses"].includes(filter) &&
          t.category === filter);

      return matchQ && matchF;
    })
    .sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    );

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = (msg) => {
    setToast(msg);

    setTimeout(() => {
      setToast("");
    }, 2200);
  };

  /* =======================================================
     ADD / EDIT TRANSACTION
  ======================================================= */

  const addTransaction = (data) => {
    const item = {
      ...data,
      id: editing?.id || Date.now(),
      amount: Number(data.amount),
    };

    const next = editing
      ? transactions.map((t) =>
          t.id === editing.id ? item : t
        )
      : [item, ...transactions];

    save(next);

    const wasEditing = Boolean(editing);

    setEditing(null);
    setShowModal(false);

    showToast(
      wasEditing
        ? "Transaction updated"
        : "Transaction added"
    );
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const remove = (id) => {
    save(
      transactions.filter((t) => t.id !== id)
    );

    showToast("Transaction deleted");
  };

  /* =======================================================
     EXPORT CSV
  ======================================================= */

  const exportCSV = () => {
    const rows = [
      [
        "Title",
        "Category",
        "Type",
        "Amount",
        "Date",
        "Note",
      ],
      ...transactions.map((t) => [
        t.title,
        t.category,
        t.type,
        t.amount,
        t.date,
        t.note,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "finora-transactions.csv";

    a.click();

    URL.revokeObjectURL(url);

    showToast("CSV exported");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className={dark ? "app dark" : "app light"}>
      <div className="ambient ambient-one" />

      <div className="ambient ambient-two" />

      <Sidebar
        page={page}
        setPage={setPage}
      />

      <main className="main">

        {/* TOP BAR */}

        <header className="topbar">

          <div>
            <div className="mobile-brand">
              <CircleDollarSign size={24} />
              Finora
            </div>

            <p className="eyebrow">
              {page === "dashboard"
                ? "PERSONAL FINANCE"
                : page.toUpperCase()}
            </p>

            <h1>
              {page === "dashboard"
                ? "Good morning, Spoorti 👋"
                : page === "transactions"
                ? "Transactions"
                : "Finance overview"}
            </h1>
          </div>

          <div className="top-actions">

            <button
              className="icon-btn"
              onClick={() => setDark(!dark)}
              title="Toggle theme"
            >
              {dark ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

          </div>

        </header>

        {/* DASHBOARD */}

        {page === "dashboard" && (
          <Dashboard
            totals={totals}
            categoryTotals={categoryTotals}
            budget={budget}
            transactions={transactions}
            setPage={setPage}
            openAdd={() => {
              setEditing(null);
              setShowModal(true);
            }}
          />
        )}

        {/* TRANSACTIONS */}

        {page === "transactions" && (
          <Transactions
            filtered={filtered}
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            openAdd={() => {
              setEditing(null);
              setShowModal(true);
            }}
            edit={(t) => {
              setEditing(t);
              setShowModal(true);
            }}
            remove={remove}
            exportCSV={exportCSV}
          />
        )}

        {/* BUDGET */}

        {page === "budget" && (
          <Budget
            budget={budget}
            setBudget={setBudget}
            spent={totals.expense}
            categoryTotals={categoryTotals}
            showToast={showToast}
          />
        )}

        {/* ANALYTICS */}

        {page === "analytics" && (
          <Analytics
            categoryTotals={categoryTotals}
            totals={totals}
            transactions={transactions}
          />
        )}

        {/* SETTINGS */}

        {page === "settings" && (
          <SettingsPanel
            dark={dark}
            setDark={setDark}
            transactions={transactions}
            clear={() => {
              save([]);
              showToast("All transactions cleared");
            }}
          />
        )}

      </main>

      {/* MODAL */}

      {showModal && (
        <TransactionModal
          initial={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={addTransaction}
        />
      )}

      {/* TOAST */}

      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}

    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ page, setPage }) {

  const items = [
    [
      "dashboard",
      "Dashboard",
      LayoutDashboard,
    ],

    [
      "transactions",
      "Transactions",
      ArrowDownLeft,
    ],

    [
      "budget",
      "Budgets",
      Target,
    ],

    [
      "analytics",
      "Analytics",
      PieChart,
    ],
  ];

  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="logo">
          <CircleDollarSign size={25} />
        </div>

        <span>Finora</span>

        <small>PERSONAL</small>

      </div>

      <nav>

        <div className="nav-label">
          MAIN MENU
        </div>

        {items.map(
          ([id, label, Icon]) => (
            <button
              key={id}
              className={
                page === id
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setPage(id)
              }
            >
              <Icon size={19} />

              <span>{label}</span>
            </button>
          )
        )}

        <div className="nav-label space">
          PREFERENCES
        </div>

        <button
          className={
            page === "settings"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setPage("settings")
          }
        >
          <Settings size={19} />

          <span>Settings</span>
        </button>

      </nav>

    </aside>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  totals,
  categoryTotals,
  budget,
  transactions,
  setPage,
  openAdd,
}) {

  /* -------------------------------------------------------
     CURRENT MONTH
  ------------------------------------------------------- */

  const today = new Date();

  const currentMonthKey =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] =
    useState(currentMonthKey);

  /* -------------------------------------------------------
     MONTH OPTIONS
  ------------------------------------------------------- */

  const monthOptions = useMemo(() => {

    const year = today.getFullYear();

    return Array.from(
      { length: 12 },
      (_, index) => {

        const monthNumber =
          index + 1;

        const date = new Date(
          year,
          index,
          1
        );

        return {
          key: `${year}-${String(
            monthNumber
          ).padStart(2, "0")}`,

          label: date.toLocaleDateString(
            "en-IN",
            {
              month: "long",
            }
          ),
        };
      }
    );

  }, []);

  /* -------------------------------------------------------
     SELECTED MONTH TRANSACTIONS
     
     IMPORTANT:
     This filters EXACTLY by selectedMonth.
  ------------------------------------------------------- */

  const selectedTransactions = useMemo(() => {

    return transactions.filter(
      (t) =>
        String(t.date).slice(0, 7) ===
        selectedMonth
    );

  }, [
    transactions,
    selectedMonth,
  ]);

  /* -------------------------------------------------------
     SELECTED MONTH INCOME
  ------------------------------------------------------- */

  const selectedIncome = useMemo(() => {

    return selectedTransactions
      .filter(
        (t) => t.type === "income"
      )
      .reduce(
        (sum, t) =>
          sum + Number(t.amount),
        0
      );

  }, [selectedTransactions]);

  /* -------------------------------------------------------
     SELECTED MONTH EXPENSE
  ------------------------------------------------------- */

  const selectedExpense = useMemo(() => {

    return selectedTransactions
      .filter(
        (t) => t.type === "expense"
      )
      .reduce(
        (sum, t) =>
          sum + Number(t.amount),
        0
      );

  }, [selectedTransactions]);

  /* -------------------------------------------------------
     SELECTED MONTH CATEGORY TOTALS
  ------------------------------------------------------- */

  const selectedCategoryTotals =
    useMemo(() => {

      const map = {};

      selectedTransactions
        .filter(
          (t) => t.type === "expense"
        )
        .forEach((t) => {

          map[t.category] =
            (map[t.category] || 0) +
            Number(t.amount);

        });

      return Object.entries(map).sort(
        (a, b) => b[1] - a[1]
      );

    }, [selectedTransactions]);

  /* -------------------------------------------------------
     BUDGET
  ------------------------------------------------------- */

  const budgetPct =
    budget > 0
      ? Math.min(
          100,
          Math.round(
            (totals.expense / budget) *
              100
          )
        )
      : 0;

  return (
    <section className="content">

      {/* HERO */}

      <div className="hero-card">

        <div>

          <span className="hero-pill">
            <Sparkles size={14} />

            Smart money dashboard
          </span>

          <h2>
            Your money,{" "}
            <span>simplified.</span>
          </h2>

          <p>
            Track spending, plan budgets
            and understand your financial
            habits in one beautiful place.
          </p>

        </div>

        <div className="hero-orb">
          <TrendingUp size={58} />
        </div>

      </div>

      {/* STAT CARDS */}

      <div className="stats-grid">

        <Stat
          title="Total Balance"
          value={currency(
            totals.balance
          )}
          icon={WalletCards}
          meta="Available balance"
          cls="green"
        />

        <Stat
          title="Total Income"
          value={currency(
            totals.income
          )}
          icon={ArrowUpRight}
          meta="All recorded income"
          cls="blue"
        />

        <Stat
          title="Total Expenses"
          value={currency(
            totals.expense
          )}
          icon={ArrowDownLeft}
          meta="All recorded expenses"
          cls="rose"
        />

        <Stat
          title="Savings Rate"
          value={`${
            totals.income
              ? Math.round(
                  (totals.balance /
                    totals.income) *
                    100
                )
              : 0
          }%`}
          icon={Target}
          meta="Income retained"
          cls="violet"
        />

      </div>

      {/* MONTHLY SECTION */}

      <div className="two-col">

        {/* MONTHLY ACTIVITY */}

        <div className="panel">

          <div className="panel-head">

            <div>

              <p className="eyebrow">
                MONTHLY ACTIVITY
              </p>

              <h3>
                Income vs Expenses
              </h3>

            </div>

            <label className="month-select">

              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(
                    e.target.value
                  )
                }
                aria-label="Select month"
              >

                {monthOptions.map(
                  (month) => (
                    <option
                      key={month.key}
                      value={month.key}
                    >
                      {month.label}
                    </option>
                  )
                )}

              </select>

            </label>

          </div>

          {/* IMPORTANT:
              Chart now receives ONLY selected month
          */}

          <MiniChart
            transactions={
              selectedTransactions
            }
            selectedMonth={
              selectedMonth
            }
          />

          {/* SELECTED MONTH VALUES */}

          <div className="legend">

            <span>
              <i className="dot income-dot" />

              Income{" "}

              <b>
                {currency(
                  selectedIncome
                )}
              </b>
            </span>

            <span>
              <i className="dot expense-dot" />

              Expenses{" "}

              <b>
                {currency(
                  selectedExpense
                )}
              </b>
            </span>

          </div>

        </div>

        {/* CATEGORY BREAKDOWN */}

        <div className="panel">

          <div className="panel-head">

            <div>

              <p className="eyebrow">
                SPENDING
              </p>

              <h3>
                Category breakdown
              </h3>

            </div>

            <button
              className="text-btn"
              onClick={() =>
                setPage("analytics")
              }
            >
              View all
            </button>

          </div>

          {/* ONLY SELECTED MONTH */}

          <CategoryBars
            data={
              selectedCategoryTotals
            }
          />

        </div>

      </div>

      {/* BOTTOM GRID */}

      <div className="two-col bottom-grid">

        {/* RECENT ACTIVITY */}

        <div className="panel">

          <div className="panel-head">

            <div>

              <p className="eyebrow">
                RECENT ACTIVITY
              </p>

              <h3>
                Latest transactions
              </h3>

            </div>

            <button
              className="text-btn"
              onClick={() =>
                setPage("transactions")
              }
            >
              View all
            </button>

          </div>

          <TransactionList
            transactions={transactions
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.date) -
                  new Date(a.date)
              )
              .slice(0, 5)}
            compact
          />

        </div>

        {/* BUDGET */}

        <div className="panel budget-panel">

          <div className="panel-head">

            <div>

              <p className="eyebrow">
                MONTHLY BUDGET
              </p>

              <h3>
                Spending limit
              </h3>

            </div>

            <Target size={20} />

          </div>

          <div className="budget-number">

            <strong>
              {currency(
                totals.expense
              )}
            </strong>

            <span>
              {" "}
              / {currency(budget)}
            </span>

          </div>

          <div className="progress">

            <i
              style={{
                width: `${budgetPct}%`,
              }}
            />

          </div>

          <div className="budget-row">

            <span>
              {budgetPct}% used
            </span>

            <span>
              {currency(
                Math.max(
                  0,
                  budget -
                    totals.expense
                )
              )}{" "}
              remaining
            </span>

          </div>

          <button
            className="primary-btn wide"
            onClick={() =>
              setPage("budget")
            }
          >
            Manage budget
          </button>

        </div>

      </div>

      {/* ADD BUTTON */}

      <button
        className="floating-add"
        onClick={openAdd}
      >
        <Plus size={22} />

        <span>
          Add transaction
        </span>
      </button>

    </section>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  title,
  value,
  icon: Icon,
  meta,
  cls,
}) {

  return (
    <div className="stat-card">

      <div
        className={`stat-icon ${cls}`}
      >
        <Icon size={20} />
      </div>

      <div className="stat-info">

        <span>{title}</span>

        <strong>{value}</strong>

        <small>{meta}</small>

      </div>

      <MoreHorizontal
        size={18}
        className="muted"
      />

    </div>
  );
}

/* =========================================================
   MINI CHART

   IMPORTANT CHANGE:
   This chart now uses ONLY the selected month's
   transactions.

   So:

   September -> September data
   October   -> October data
   November  -> November data
   December  -> December data

   Empty month -> ₹0
========================================================= */

function MiniChart({
  transactions,
  selectedMonth,
}) {

  const [year, month] =
    selectedMonth
      .split("-")
      .map(Number);

  const daysInMonth = new Date(
    year,
    month,
    0
  ).getDate();

  /* -------------------------------------------------------
     DAILY TOTALS
  ------------------------------------------------------- */

  const dailyData = Array.from(
    { length: daysInMonth },
    (_, index) => {

      const day =
        index + 1;

      const dayString =
        String(day).padStart(2, "0");

      const dateKey =
        `${selectedMonth}-${dayString}`;

      const rows =
        transactions.filter(
          (t) =>
            String(t.date) ===
            dateKey
        );

      const income =
        rows
          .filter(
            (t) =>
              t.type === "income"
          )
          .reduce(
            (sum, t) =>
              sum +
              Number(t.amount),
            0
          );

      const expense =
        rows
          .filter(
            (t) =>
              t.type === "expense"
          )
          .reduce(
            (sum, t) =>
              sum +
              Number(t.amount),
            0
          );

      return {
        day,
        income,
        expense,
      };
    }
  );

  const maxValue = Math.max(
    1,
    ...dailyData.flatMap(
      (d) => [
        d.income,
        d.expense,
      ]
    )
  );

  /* -------------------------------------------------------
     SHOW FEWER LABELS SO CHART DOES NOT LOOK CROWDED
  ------------------------------------------------------- */

  const labelEvery =
    daysInMonth <= 28
      ? 4
      : 5;

  return (
    <div className="chart">

      <div className="chart-grid">

        {dailyData.map((day) => (

          <div
            className="bar-wrap"
            key={day.day}
            title={`Day ${day.day}: Income ${currency(
              day.income
            )} • Expenses ${currency(
              day.expense
            )}`}
          >

            <div
              className="bar income-bar"
              style={{
                height: `${
                  day.income
                    ? Math.max(
                        4,
                        (day.income /
                          maxValue) *
                          92
                      )
                    : 0
                }%`,
              }}
            />

            <div
              className="bar expense-bar"
              style={{
                height: `${
                  day.expense
                    ? Math.max(
                        4,
                        (day.expense /
                          maxValue) *
                          92
                      )
                    : 0
                }%`,
              }}
            />

          </div>

        ))}

      </div>

      <div className="months">

        {dailyData.map((day) => (

          <span key={day.day}>

            {day.day === 1 ||
            day.day % labelEvery === 0
              ? day.day
              : ""}

          </span>

        ))}

      </div>

    </div>
  );
}

/* =========================================================
   CATEGORY BARS
========================================================= */

function CategoryBars({ data }) {

  const max =
    data[0]?.[1] || 1;

  if (!data.length) {

    return (
      <div className="empty">
        No expense data for this month.
      </div>
    );

  }

  return (
    <div className="category-list">

      {data
        .slice(0, 5)
        .map(
          ([name, value]) => {

            const meta =
              categoryMeta[name] ||
              categoryMeta.Other;

            const Icon =
              meta.icon;

            return (
              <div
                className="cat-row"
                key={name}
              >

                <div
                  className={`cat-icon ${meta.cls}`}
                >
                  <Icon size={16} />
                </div>

                <div className="cat-main">

                  <div>

                    <span>
                      {name}
                    </span>

                    <b>
                      {currency(
                        value
                      )}
                    </b>

                  </div>

                  <div className="thin-progress">

                    <i
                      style={{
                        width: `${
                          (value /
                            max) *
                          100
                        }%`,
                      }}
                    />

                  </div>

                </div>

              </div>
            );
          }
        )}

    </div>
  );
}

/* =========================================================
   TRANSACTION LIST
========================================================= */

function TransactionList({
  transactions,
  compact = false,
  onEdit,
  onDelete,
}) {

  return (
    <div className="transactions-list">

      {transactions.map((t) => {

        const meta =
          categoryMeta[t.category] || {
            icon:
              CircleDollarSign,
            cls: "slate",
          };

        const Icon =
          meta.icon;

        return (
          <div
            className="transaction"
            key={t.id}
          >

            <div
              className={`tx-icon ${
                t.type === "income"
                  ? "income"
                  : "expense"
              } ${meta.cls}`}
            >
              <Icon size={17} />
            </div>

            <div className="tx-main">

              <b>{t.title}</b>

              <span>

                {t.category} •{" "}

                {new Date(
                  t.date
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                  }
                )}

              </span>

            </div>

            <strong
              className={
                t.type === "income"
                  ? "money-in"
                  : "money-out"
              }
            >

              {t.type === "income"
                ? "+"
                : "-"}

              {currency(
                t.amount
              )}

            </strong>

            {!compact && (
              <div className="row-actions">

                <button
                  onClick={() =>
                    onEdit(t)
                  }
                  aria-label="Edit transaction"
                >
                  <Pencil
                    size={15}
                  />
                </button>

                <button
                  onClick={() =>
                    onDelete(t.id)
                  }
                  aria-label="Delete transaction"
                >
                  <Trash2
                    size={15}
                  />
                </button>

              </div>
            )}

          </div>
        );
      })}

    </div>
  );
}

/* =========================================================
   TRANSACTIONS PAGE
========================================================= */

function Transactions({
  filtered,
  query,
  setQuery,
  filter,
  setFilter,
  openAdd,
  edit,
  remove,
  exportCSV,
}) {

  return (
    <section className="content">

      <div className="page-title-row">

        <div>

          <p className="eyebrow">
            MONEY MOVEMENT
          </p>

          <h2>
            All transactions
          </h2>

          <p className="muted-text">
            Search, filter and manage
            every income or expense.
          </p>

        </div>

        <div className="action-row">

          <button
            className="secondary-btn"
            onClick={exportCSV}
          >
            <Download size={17} />

            Export CSV
          </button>

          <button
            className="primary-btn"
            onClick={openAdd}
          >
            <Plus size={18} />

            Add transaction
          </button>

        </div>

      </div>

      <div className="panel table-panel">

        <div className="toolbar">

          <div className="search">

            <Search size={18} />

            <input
              placeholder="Search transactions..."
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
            />

          </div>

          <div className="filter-wrap">

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value
                )
              }
            >

              <option>
                All
              </option>

              <option>
                Income
              </option>

              <option>
                Expenses
              </option>

              {Object.keys(
                categoryMeta
              ).map((c) => (
                <option key={c}>
                  {c}
                </option>
              ))}

            </select>

          </div>

        </div>

        <TransactionList
          transactions={filtered}
          onEdit={edit}
          onDelete={remove}
        />

        {!filtered.length && (
          <div className="empty large">
            No transactions match
            your search.
          </div>
        )}

      </div>

    </section>
  );
}

/* =========================================================
   BUDGET
========================================================= */

function Budget({
  budget,
  setBudget,
  spent,
  categoryTotals,
  showToast,
}) {

  const pct =
    budget > 0
      ? Math.min(
          100,
          Math.round(
            (spent / budget) * 100
          )
        )
      : 0;

  return (
    <section className="content">

      <div className="page-title-row">

        <div>

          <p className="eyebrow">
            PLAN AHEAD
          </p>

          <h2>
            Budgets
          </h2>

          <p className="muted-text">
            Set a monthly limit and
            keep your spending
            intentional.
          </p>

        </div>

      </div>

      <div className="budget-layout">

        <div className="panel big-budget">

          <div className="budget-ring">

            <div>

              <strong>
                {pct}%
              </strong>

              <span>
                used
              </span>

            </div>

          </div>

          <p className="eyebrow">
            MONTHLY SPENDING
          </p>

          <h3>

            {currency(spent)}{" "}

            <small>
              of {currency(budget)}
            </small>

          </h3>

          <div className="progress big">

            <i
              style={{
                width: `${pct}%`,
              }}
            />

          </div>

          <div className="budget-row">

            <span>
              Spent
            </span>

            <b>
              {currency(spent)}
            </b>

          </div>

          <div className="budget-row">

            <span>
              Remaining
            </span>

            <b>
              {currency(
                Math.max(
                  0,
                  budget - spent
                )
              )}
            </b>

          </div>

        </div>

        <div className="panel budget-editor">

          <p className="eyebrow">
            BUDGET SETTINGS
          </p>

          <h3>
            Monthly limit
          </h3>

          <p className="muted-text">
            Choose an amount that
            works for your current
            goals.
          </p>

          <label>
            Budget amount

            <div className="money-input">

              <span>
                ₹
              </span>

              <input
                type="number"
                value={budget}
                onChange={(e) =>
                  setBudget(
                    Math.max(
                      0,
                      Number(
                        e.target.value
                      )
                    )
                  )
                }
              />

            </div>

          </label>

          <button
            className="primary-btn wide"
            onClick={() =>
              showToast(
                "Budget updated"
              )
            }
          >
            Save budget
          </button>

          <div className="tip">

            <Sparkles size={17} />

            <span>

              <b>
                Smart tip:
              </b>{" "}

              Try keeping fixed
              costs below 50% of
              your monthly income.

            </span>

          </div>

        </div>

      </div>

      <div className="panel">

        <div className="panel-head">

          <div>

            <p className="eyebrow">
              BY CATEGORY
            </p>

            <h3>
              Where your budget goes
            </h3>

          </div>

        </div>

        <CategoryBars
          data={categoryTotals}
        />

      </div>

    </section>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function Analytics({
  categoryTotals,
  totals,
  transactions,
}) {

  const highest =
    categoryTotals[0];

  return (
    <section className="content">

      <div className="page-title-row">

        <div>

          <p className="eyebrow">
            INSIGHTS
          </p>

          <h2>
            Analytics
          </h2>

          <p className="muted-text">
            Simple insights from your
            stored transactions.
          </p>

        </div>

      </div>

      <div className="insight-grid">

        <div className="insight-card">

          <TrendingUp size={22} />

          <span>
            Net cash flow
          </span>

          <strong>
            {currency(
              totals.balance
            )}
          </strong>

          <small>
            Income minus expenses
          </small>

        </div>

        <div className="insight-card">

          <PieChart size={22} />

          <span>
            Top category
          </span>

          <strong>
            {highest?.[0] || "—"}
          </strong>

          <small>
            {highest
              ? currency(
                  highest[1]
                )
              : "No data"}
          </small>

        </div>

        <div className="insight-card">

          <CalendarDays
            size={22}
          />

          <span>
            Transactions
          </span>

          <strong>
            {transactions.length}
          </strong>

          <small>
            Recorded locally
          </small>

        </div>

      </div>

      <div className="two-col">

        <div className="panel">

          <div className="panel-head">

            <div>

              <p className="eyebrow">
                DISTRIBUTION
              </p>

              <h3>
                Expense categories
              </h3>

            </div>

          </div>

          <CategoryBars
            data={categoryTotals}
          />

        </div>

        <div className="panel">

          <div className="panel-head">

            <div>

              <p className="eyebrow">
                FINANCIAL HEALTH
              </p>

              <h3>
                Quick summary
              </h3>

            </div>

            <Sparkles size={20} />

          </div>

          <div className="summary-box">

            <p>
              Your current balance
              is{" "}
              <b>
                {currency(
                  totals.balance
                )}
              </b>.
            </p>

            <p>

              You have recorded{" "}

              <b>
                {
                  transactions.filter(
                    (t) =>
                      t.type ===
                      "expense"
                  ).length
                }
              </b>{" "}

              expenses and{" "}

              <b>
                {
                  transactions.filter(
                    (t) =>
                      t.type ===
                      "income"
                  ).length
                }
              </b>{" "}

              income entries.

            </p>

            <p>
              Use budgets to create
              a spending limit and
              export CSV when you
              want a backup.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPanel({
  dark,
  setDark,
  transactions,
  clear,
}) {

  return (
    <section className="content">

      <div className="page-title-row">

        <div>

          <p className="eyebrow">
            PREFERENCES
          </p>

          <h2>
            Settings
          </h2>

          <p className="muted-text">
            Customize your Finora
            experience.
          </p>

        </div>

      </div>

      <div className="panel settings-list">

        <div className="setting">

          <div>

            <b>
              Appearance
            </b>

            <span>
              Switch between premium
              dark and clean light
              mode.
            </span>

          </div>

          <button
            className="toggle"
            onClick={() =>
              setDark(!dark)
            }
          >

            <i
              className={
                dark ? "on" : ""
              }
            />

          </button>

        </div>

        <div className="setting">

          <div>

            <b>
              Local storage
            </b>

            <span>
              {transactions.length}{" "}
              transactions are saved
              in this browser.
            </span>

          </div>

          <span className="status">

            <Check size={14} />

            Active

          </span>

        </div>

        <div className="setting danger">

          <div>

            <b>
              Clear all data
            </b>

            <span>
              This removes every
              transaction from
              localStorage.
            </span>

          </div>

          <button
            className="secondary-btn danger-btn"
            onClick={() => {

              if (
                confirm(
                  "Clear all transactions?"
                )
              ) {
                clear();
              }

            }}
          >

            <Trash2 size={16} />

            Clear data

          </button>

        </div>

      </div>

    </section>
  );
}

/* =========================================================
   TRANSACTION MODAL
========================================================= */

function TransactionModal({
  initial,
  onClose,
  onSave,
}) {

  const [form, setForm] =
    useState(
      initial || {
        title: "",
        category: "Food",
        type: "expense",
        amount: "",
        date: new Date()
          .toISOString()
          .slice(0, 10),
        note: "",
      }
    );

  const update = (key, value) => {

    setForm({
      ...form,
      [key]: value,
    });

  };

  return (
    <div className="modal-backdrop">

      <div className="modal">

        <div className="modal-head">

          <div>

            <p className="eyebrow">

              {initial
                ? "EDIT"
                : "NEW"}{" "}
              TRANSACTION

            </p>

            <h3>

              {initial
                ? "Edit transaction"
                : "Add transaction"}

            </h3>

          </div>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>

        {/* TYPE */}

        <div className="type-switch">

          <button
            className={
              form.type ===
              "expense"
                ? "selected expense-tab"
                : ""
            }
            onClick={() =>
              update(
                "type",
                "expense"
              )
            }
          >

            <ArrowDownLeft
              size={16}
            />

            Expense

          </button>

          <button
            className={
              form.type ===
              "income"
                ? "selected income-tab"
                : ""
            }
            onClick={() =>
              update(
                "type",
                "income"
              )
            }
          >

            <ArrowUpRight
              size={16}
            />

            Income

          </button>

        </div>

        {/* TITLE */}

        <label>

          Title

          <input
            autoFocus
            value={form.title}
            onChange={(e) =>
              update(
                "title",
                e.target.value
              )
            }
            placeholder="e.g. Groceries"
          />

        </label>

        {/* AMOUNT + DATE */}

        <div className="form-grid">

          <label>

            Amount

            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) =>
                update(
                  "amount",
                  e.target.value
                )
              }
              placeholder="0"
            />

          </label>

          <label>

            Date

            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                update(
                  "date",
                  e.target.value
                )
              }
            />

          </label>

        </div>

        {/* CATEGORY + NOTE */}

        <div className="form-grid">

          <label>

            Category

            <select
              value={form.category}
              onChange={(e) =>
                update(
                  "category",
                  e.target.value
                )
              }
            >

              <option>
                Housing
              </option>

              <option>
                Food
              </option>

              <option>
                Transport
              </option>

              <option>
                Education
              </option>

              <option>
                Health
              </option>

              <option>
                Bills
              </option>

              <option>
                Shopping
              </option>

              <option>
                Other
              </option>

              <option>
                Income
              </option>

            </select>

          </label>

          <label>

            Note

            <input
              value={form.note}
              onChange={(e) =>
                update(
                  "note",
                  e.target.value
                )
              }
              placeholder="Optional note"
            />

          </label>

        </div>

        {/* ACTIONS */}

        <div className="modal-actions">

          <button
            className="secondary-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary-btn"
            disabled={
              !form.title ||
              !form.amount
            }
            onClick={() =>
              onSave(form)
            }
          >

            <Check size={17} />

            {initial
              ? "Save changes"
              : "Add transaction"}

          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default App;