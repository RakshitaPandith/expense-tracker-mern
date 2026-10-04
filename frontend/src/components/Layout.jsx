import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import {
  ArrowDown,
  ArrowUp,
  Activity,
  Car,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Gift,
  Home,
  PieChart,
  PiggyBank,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";

import { styles } from "../assets/dummyStyles";


// =====================================================
// CATEGORY ICONS
// =====================================================

const CATEGORY_ICONS = {
  Food: <Utensils className="w-4 h-4" />,
  Housing: <Home className="w-4 h-4" />,
  Transport: <Car className="w-4 h-4" />,
  Shopping: <ShoppingCart className="w-4 h-4" />,
  Entertainment: <Gift className="w-4 h-4" />,
  Utilities: <Zap className="w-4 h-4" />,
  Healthcare: <Activity className="w-4 h-4" />,
  Salary: <ArrowUp className="w-4 h-4" />,
  Freelance: <CreditCard className="w-4 h-4" />,
  Savings: <PiggyBank className="w-4 h-4" />,
};


// =====================================================
// MAIN LAYOUT
// =====================================================

const Layout = ({ user, onLogout }) => {
  const location = useLocation();

  const [transactions, setTransactions] = useState([]);

  const [timeFrame, setTimeFrame] = useState("monthly");

  const [loading, setLoading] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [showAllTransactions, setShowAllTransactions] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState(new Date());


  // ===================================================
  // API BASE URL
  // ===================================================

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000/api";


  // ===================================================
  // GET TRANSACTIONS FROM RESPONSE
  // ===================================================

  const safeArrayFromResponse = (res) => {
    const body = res?.data;

    if (!body) return [];

    if (Array.isArray(body)) {
      return body;
    }

    if (Array.isArray(body.data)) {
      return body.data;
    }

    if (Array.isArray(body.incomes)) {
      return body.incomes;
    }

    if (Array.isArray(body.expenses)) {
      return body.expenses;
    }

    return [];
  };


  // ===================================================
  // FETCH TRANSACTIONS
  // ===================================================

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};


      const [incomeRes, expenseRes] =
        await Promise.all([
          axios.get(
            `${API_BASE}/income/get`,
            { headers }
          ),

          axios.get(
            `${API_BASE}/expense/get`,
            { headers }
          ),
        ]);


      // -------------------------------
      // INCOME
      // -------------------------------

      const incomes =
        safeArrayFromResponse(incomeRes).map(
          (income) => ({
            ...income,
            type: "income",
          })
        );


      // -------------------------------
      // EXPENSE
      // -------------------------------

      const expenses =
        safeArrayFromResponse(expenseRes).map(
          (expense) => ({
            ...expense,
            type: "expense",
          })
        );


      // -------------------------------
      // COMBINE BOTH
      // -------------------------------

      const allTransactions = [
        ...incomes,
        ...expenses,
      ]
        .map((transaction) => ({
          id:
            transaction._id ||
            transaction.id ||
            Math.random()
              .toString(36)
              .slice(2),

          description:
            transaction.description ||
            transaction.title ||
            transaction.note ||
            "",

          amount:
            transaction.amount != null
              ? Number(transaction.amount)
              : Number(transaction.value) || 0,

          date:
            transaction.date ||
            transaction.createdAt ||
            new Date().toISOString(),

          category:
            transaction.category ||
            transaction.type ||
            "Other",

          type: transaction.type,

          raw: transaction,
        }))

        // newest transaction first
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        );


      setTransactions(allTransactions);

      setLastUpdated(new Date());

    } catch (error) {

      console.error(
        "Failed to fetch transactions",
        error?.response ||
          error.message ||
          error
      );

    } finally {

      setLoading(false);

    }
  };


  // ===================================================
  // ADD TRANSACTION
  // ===================================================

  const addTransaction = async (transaction) => {
    try {

      const token =
        localStorage.getItem("token");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};


      const endpoint =
        transaction.type === "income"
          ? "income/add"
          : "expense/add";


      await axios.post(
        `${API_BASE}/${endpoint}`,
        transaction,
        { headers }
      );


      await fetchTransactions();

      return true;

    } catch (error) {

      console.error(
        "Failed to add transaction",
        error?.response ||
          error.message ||
          error
      );

      throw error;
    }
  };


  // ===================================================
  // EDIT TRANSACTION
  // ===================================================

  const editTransaction = async (
    id,
    transaction
  ) => {
    try {

      const token =
        localStorage.getItem("token");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};


      const endpoint =
        transaction.type === "income"
          ? "income/update"
          : "expense/update";


      await axios.put(
        `${API_BASE}/${endpoint}/${id}`,
        transaction,
        { headers }
      );


      await fetchTransactions();

      return true;

    } catch (error) {

      console.error(
        "Failed to edit transaction",
        error?.response ||
          error.message ||
          error
      );

      throw error;
    }
  };


  // ===================================================
  // DELETE TRANSACTION
  // ===================================================

  const deleteTransaction = async (
    id,
    type
  ) => {
    try {

      const token =
        localStorage.getItem("token");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};


      const endpoint =
        type === "income"
          ? "income/delete"
          : "expense/delete";


      await axios.delete(
        `${API_BASE}/${endpoint}/${id}`,
        { headers }
      );


      await fetchTransactions();

      return true;

    } catch (error) {

      console.error(
        "Failed to delete transaction",
        error?.response ||
          error.message ||
          error
      );

      throw error;
    }
  };


  // ===================================================
  // FETCH DATA WHEN PAGE LOADS
  // ===================================================

  useEffect(() => {
    fetchTransactions();
  }, []);


  // ===================================================
  // FILTER TRANSACTIONS
  // ===================================================

  const filterTransactions = (
    transactions,
    frame
  ) => {

    const now = new Date();

    const today = new Date(
      now
    ).setHours(0, 0, 0, 0);


    switch (frame) {

      case "daily":
        return transactions.filter(
          (transaction) =>
            new Date(transaction.date) >=
            today
        );


      case "weekly": {

        const startOfWeek =
          new Date(today);

        startOfWeek.setDate(
          startOfWeek.getDate() -
            startOfWeek.getDay()
        );

        return transactions.filter(
          (transaction) =>
            new Date(transaction.date) >=
            startOfWeek
        );
      }


      case "monthly":

        return transactions.filter(
          (transaction) =>
            new Date(transaction.date)
              .getMonth() ===
              now.getMonth()
        );


      default:
        return transactions;
    }
  };


  const filteredTransactions = useMemo(
    () =>
      filterTransactions(
        transactions,
        timeFrame
      ),
    [
      transactions,
      timeFrame,
    ]
  );


  // ===================================================
  // STATISTICS
  // ===================================================

  const stats = useMemo(() => {

    const now = new Date();


    const thirtyDaysAgo =
      new Date(now);

    thirtyDaysAgo.setDate(
      now.getDate() - 30
    );


    // Last 30 days

    const last30DaysTransactions =
      transactions.filter(
        (transaction) =>
          new Date(transaction.date) >=
          thirtyDaysAgo
      );


    const last30DaysIncome =
      last30DaysTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "income"
        )
        .reduce(
          (sum, transaction) =>
            sum +
            Number(transaction.amount),
          0
        );


    const last30DaysExpenses =
      last30DaysTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense"
        )
        .reduce(
          (sum, transaction) =>
            sum +
            Number(transaction.amount),
          0
        );


    // All time

    const allTimeIncome =
      transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "income"
        )
        .reduce(
          (sum, transaction) =>
            sum +
            Number(transaction.amount),
          0
        );


    const allTimeExpenses =
      transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense"
        )
        .reduce(
          (sum, transaction) =>
            sum +
            Number(transaction.amount),
          0
        );


    // Savings rate

    const savingsRate =
      last30DaysIncome > 0
        ? Math.round(
            (
              (
                last30DaysIncome -
                last30DaysExpenses
              ) /
              last30DaysIncome
            ) *
              100
          )
        : 0;


    // Previous 30 days

    const sixtyDaysAgo =
      new Date(now);

    sixtyDaysAgo.setDate(
      now.getDate() - 60
    );


    const previous30DaysTransactions =
      transactions.filter(
        (transaction) => {

          const date =
            new Date(
              transaction.date
            );

          return (
            date >= sixtyDaysAgo &&
            date < thirtyDaysAgo
          );
        }
      );


    const previous30DaysExpenses =
      previous30DaysTransactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense"
        )
        .reduce(
          (sum, transaction) =>
            sum +
            Number(transaction.amount),
          0
        );


    const expenseChange =
      previous30DaysExpenses > 0
        ? Math.round(
            (
              (
                last30DaysExpenses -
                previous30DaysExpenses
              ) /
              previous30DaysExpenses
            ) *
              100
          )
        : 0;


    return {

      totalTransactions:
        transactions.length,

      last30DaysIncome,

      last30DaysExpenses,

      last30DaysSavings:
        last30DaysIncome -
        last30DaysExpenses,

      allTimeIncome,

      allTimeExpenses,

      allTimeSavings:
        allTimeIncome -
        allTimeExpenses,

      last30DaysCount:
        last30DaysTransactions.length,

      savingsRate,

      expenseChange,
    };

  }, [transactions]);


  // ===================================================
  // TIME FRAME LABEL
  // ===================================================

  const timeFrameLabel =
    timeFrame === "daily"
      ? "Today"
      : timeFrame === "weekly"
      ? "This Week"
      : "This Month";


  // ===================================================
  // SAVINGS RATING
  // ===================================================

  const getSavingsRating = (
    rate
  ) =>
    rate > 30
      ? "Excellent"
      : rate > 20
      ? "Good"
      : "Needs improvement";


  // ===================================================
  // TOP CATEGORIES
  // ===================================================

  const topCategories = useMemo(
    () =>
      Object.entries(
        transactions
          .filter(
            (transaction) =>
              transaction.type ===
              "expense"
          )
          .reduce(
            (acc, transaction) => {

              acc[
                transaction.category
              ] =
                (
                  acc[
                    transaction.category
                  ] || 0
                ) +
                Number(
                  transaction.amount
                );

              return acc;
            },
            {}
          )
      )
        .sort(
          (a, b) => b[1] - a[1]
        )
        .slice(0, 5),

    [transactions]
  );


  // ===================================================
  // DISPLAYED TRANSACTIONS
  // ===================================================

  const displayedTransactions =
    showAllTransactions
      ? transactions
      : transactions.slice(0, 4);


  // ===================================================
  // OUTLET CONTEXT
  // ===================================================

  const outletContext = {

    transactions:
      filteredTransactions,

    addTransaction,

    editTransaction,

    deleteTransaction,

    refreshTransactions:
      fetchTransactions,

    timeFrame,

    setTimeFrame,

    lastUpdated,
  };


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}

      <Navbar
        user={user}
        onLogout={onLogout}
      />


      {/* SIDEBAR */}

      <Sidebar
        user={user}
        onLogout={onLogout}
        collapsed={
          sidebarCollapsed
        }
        setCollapsed={
          setSidebarCollapsed
        }
      />


      {/* MAIN CONTENT */}

      <main
        className={`
          pt-16
          transition-all
          duration-300
          ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }
        `}
      >

        <div className="p-4 md:p-6">

          {/* ================================================= */}
          {/* DASHBOARD */}
          {/* ================================================= */}

          {location.pathname === "/" || location.pathname ==="/income" || location.pathname ==="/profile" ? (

            <>

              {/* Dashboard Header */}

              <div className="mb-6">

                <h1 className="text-2xl font-bold text-gray-800">
                  Dashboard
                </h1>

                <p className="text-sm text-gray-500">
                  Welcome Back
                </p>

              </div>


              {/* ================================================= */}
              {/* SUMMARY CARDS */}
              {/* ================================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">


                {/* Total Balance */}

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

                  <div className="flex justify-between items-start">

                    <div>

                      <p className="text-xs text-gray-500">
                        Total Balance
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        $
                        {(
                          stats.allTimeIncome -
                          stats.allTimeExpenses
                        ).toLocaleString()}
                      </h2>

                      <p className="text-xs text-teal-600 mt-2">
                        +$
                        {stats.last30DaysSavings.toLocaleString()}
                        {" "}this month
                      </p>

                    </div>

                    <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                      <Wallet size={18} />
                    </div>

                  </div>

                </div>


                {/* Monthly Income */}

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

                  <div className="flex justify-between items-start">

                    <div>

                      <p className="text-xs text-gray-500">
                        Monthly Income
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        $
                        {stats.last30DaysIncome.toLocaleString()}
                      </h2>

                      <p className="text-xs text-green-600 mt-2">
                        +12.5% from last month
                      </p>

                    </div>

                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <ArrowUp size={18} />
                    </div>

                  </div>

                </div>


                {/* Monthly Expense */}

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

                  <div className="flex justify-between items-start">

                    <div>

                      <p className="text-xs text-gray-500">
                        Monthly Expense
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        $
                        {stats.last30DaysExpenses.toLocaleString()}
                      </h2>

                      <p className="text-xs text-green-600 mt-2">
                        {stats.expenseChange}%
                        {" "}from last month
                      </p>

                    </div>

                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                      <ArrowDown size={18} />
                    </div>

                  </div>

                </div>


                {/* Saving Rate */}

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

                  <div className="flex justify-between items-start">

                    <div>

                      <p className="text-xs text-gray-500">
                        Saving Rate
                      </p>

                      <h2 className="text-xl font-bold text-gray-800 mt-1">
                        {stats.savingsRate}%
                      </h2>

                      <p className="text-xs text-gray-500 mt-2">
                        {getSavingsRating(
                          stats.savingsRate
                        )}
                      </p>

                    </div>

                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <PiggyBank size={18} />
                    </div>

                  </div>

                </div>

              </div>


              {/* ================================================= */}
              {/* LOWER DASHBOARD GRID */}
              {/* ================================================= */}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                {/* Financial Overview */}

                <div className="lg:col-span-2">

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

                    <h2 className="font-bold text-gray-800 flex items-center gap-2">

                      <TrendingUp
                        size={18}
                        className="text-teal-500"
                      />

                      Financial Overview

                      <span className="text-xs font-normal text-gray-400">
                        ({timeFrameLabel})
                      </span>

                    </h2>

                   <Outlet context = {outletContext}/>

                  </div>

                </div>


                {/* RIGHT COLUMN */}

                <div className="space-y-6">


                  {/* ================================================= */}
                  {/* RECENT TRANSACTIONS */}
                  {/* ================================================= */}

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

                    <div className="flex justify-between items-center mb-3">

                      <h2 className="font-bold text-gray-800 flex items-center gap-2">

                        <Clock
                          size={18}
                          className="text-purple-400"
                        />

                        Recent Transactions

                      </h2>

                      <button
                        onClick={
                          fetchTransactions
                        }
                        className="text-gray-400 hover:text-teal-500"
                      >
                        <RefreshCw
                          size={16}
                        />
                      </button>

                    </div>


                    <div className="bg-blue-50 text-xs text-gray-500 rounded-lg p-2 mb-3">
                      ℹ Transactions are stacked by date (newest first)
                    </div>


                    {loading ? (

                      <div className="py-8 text-center text-gray-400">
                        Loading...
                      </div>

                    ) : transactions.length === 0 ? (

                      <div className="text-center py-8">

                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center">

                          <Clock
                            size={22}
                            className="text-purple-400"
                          />

                        </div>

                        <p className="text-gray-600 font-medium">
                          No recent transactions
                        </p>

                      </div>

                    ) : (

                      <>

                        <div className="space-y-3">

                          {displayedTransactions.map(
                            ({
                              id,
                              description,
                              amount,
                              date,
                              category,
                              type,
                            }) => (

                              <div
                                key={id}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                              >

                                <div className="flex items-center gap-3">

                                  <div className="p-2 rounded-lg bg-gray-100">

                                    {CATEGORY_ICONS[
                                      category
                                    ] || (
                                      <Wallet
                                        size={16}
                                      />
                                    )}

                                  </div>

                                  <div>

                                    <p className="font-medium text-gray-800">
                                      {description}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                      {new Date(
                                        date
                                      ).toLocaleDateString()}

                                      <span className="ml-2 capitalize">
                                        {category}
                                      </span>
                                    </p>

                                  </div>

                                </div>


                                <span
                                  className={
                                    type ===
                                    "income"
                                      ? "font-bold text-green-600"
                                      : "font-bold text-orange-600"
                                  }
                                >
                                  {type ===
                                  "income"
                                    ? "+"
                                    : "-"}
                                  $
                                  {Number(
                                    amount
                                  ).toLocaleString()}
                                </span>

                              </div>

                            )
                          )}

                        </div>


                        {/* VIEW ALL BUTTON */}

                        <div className="pt-4 border-t border-gray-100 mt-4">

                          <button
                            onClick={() =>
                              setShowAllTransactions(
                                !showAllTransactions
                              )
                            }
                            className="w-full flex items-center justify-center gap-2 py-3 text-teal-600 font-medium hover:bg-teal-50 rounded-xl transition-colors"
                          >

                            {showAllTransactions ? (

                              <>
                                <ChevronUp
                                  className="w-5 h-5"
                                />

                                Show Less
                              </>

                            ) : (

                              <>
                                <ChevronDown
                                  className="w-5 h-5"
                                />

                                View All Transactions (
                                {
                                  transactions.length
                                }
                                )
                              </>

                            )}

                          </button>

                        </div>

                      </>

                    )}

                  </div>


                  {/* ================================================= */}
                  {/* SPENDING BY CATEGORY */}
                  {/* ================================================= */}

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

                    <h3 className="font-bold text-gray-800 flex items-center gap-2">

                      <PieChart
                        className="text-teal-500"
                        size={18}
                      />

                      Spending by Category

                    </h3>


                    <div className="mt-5">

                      {topCategories.length ===
                      0 ? (

                        <div className="grid grid-cols-2 gap-3">

                          {/* TOTAL INCOME */}

                          <div className="bg-teal-50 rounded-lg p-4">

                            <p className="text-xs text-gray-600">
                              Total Income
                            </p>

                            <p className="font-bold text-gray-800">
                              $
                              {stats.allTimeIncome.toLocaleString()}
                            </p>

                          </div>


                          {/* TOTAL EXPENSE */}

                          <div className="bg-orange-50 rounded-lg p-4">

                            <p className="text-xs text-gray-600">
                              Total Expense
                            </p>

                            <p className="font-bold text-gray-800">
                              $
                              {stats.allTimeExpenses.toLocaleString()}
                            </p>

                          </div>

                        </div>

                      ) : (

                        <div className="space-y-3">

                          {topCategories.map(
                            (
                              [
                                category,
                                amount,
                              ]
                            ) => (

                              <div
                                key={category}
                                className="flex items-center justify-between"
                              >

                                <div className="flex items-center gap-3">

                                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">

                                    {CATEGORY_ICONS[
                                      category
                                    ] || (
                                      <span>
                                        $
                                      </span>
                                    )}

                                  </div>

                                  <span className="text-sm font-medium text-gray-700">
                                    {category}
                                  </span>

                                </div>

                                <span className="font-semibold text-gray-800">
                                  $
                                  {amount.toLocaleString()}
                                </span>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              </div>

            </>

          ) : (

            // =================================================
            // OTHER PAGES
            // =================================================

            <Outlet
              context={
                outletContext
              }
            />

          )}

        </div>

      </main>

    </div>
  );
};


export default Layout;