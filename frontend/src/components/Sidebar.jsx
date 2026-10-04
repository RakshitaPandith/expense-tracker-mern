import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ArrowUp,
  ArrowDown,
  User,
  Menu,
  X,
  HelpCircle,
  LogOut,
} from "lucide-react";

import { sidebarStyles, cn } from "../assets/dummyStyles";

const MENU_ITEMS = [
  {
    text: "Dashboard",
    path: "/",
    icon: <Home size={20} />,
  },
  {
    text: "Income",
    path: "/income",
    icon: <ArrowUp size={20} />,
  },
  {
    text: "Expenses",
    path: "/expense",
    icon: <ArrowDown size={20} />,
  },
  {
    text: "Profile",
    path: "/profile",
    icon: <User size={20} />,
  },
];

const Sidebar = ({ user, onLogout }) => {
 
  const { pathname } = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarRef = useRef(null);

  const username = user?.name || "User";
  const email = user?.email || "user@example.com";

  const initials = username
    ? username.charAt(0).toUpperCase()
    : "U";

  // Prevent the background page from scrolling
  // when the mobile sidebar is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  // Close mobile sidebar when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Desktop menu item
  const renderMenuItem = ({ text, path, icon }) => {
    const isActive = pathname === path;

    return (
      <motion.li
        key={text}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          to={path}
          className={cn(
            sidebarStyles.menuItem.base,
            isActive
              ? sidebarStyles.menuItem.active
              : sidebarStyles.menuItem.inactive,
            isCollapsed
              ? sidebarStyles.menuItem.collapsed
              : sidebarStyles.menuItem.expanded
          )}
          onMouseEnter={() => setActiveHover(text)}
          onMouseLeave={() => setActiveHover(null)}
        >
          <span
            className={
              isActive
                ? sidebarStyles.menuIcon.active
                : sidebarStyles.menuIcon.inactive
            }
          >
            {icon}
          </span>

          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {text}
            </motion.span>
          )}

          {activeHover === text &&
            !isActive &&
            !isCollapsed && (
              <span className={sidebarStyles.activeIndicator}></span>
            )}
        </Link>
      </motion.li>
    );
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}

      <motion.aside
        className={sidebarStyles.sidebarContainer.base}
        animate={{
          width: isCollapsed ? "80px" : "256px",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className={sidebarStyles.sidebarInner.base}>
          {/* USER PROFILE */}
          <div
            className={cn(
              sidebarStyles.userProfileContainer.base,
              isCollapsed
                ? sidebarStyles.userProfileContainer.collapsed
                : sidebarStyles.userProfileContainer.expanded
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center"
              )}
            >
              <div className={sidebarStyles.userInitials.base}>
                {initials}
              </div>

              {!isCollapsed && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {username}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* COLLAPSE BUTTON */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={sidebarStyles.toggleButton.base}
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{
                rotate: isCollapsed ? 0 : 180,
              }}
              transition={{ duration: 0.3 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline
                  points={
                    isCollapsed
                      ? "9 18 15 12 9 6"
                      : "15 18 9 12 15 6"
                  }
                />
              </svg>
            </motion.div>
          </button>

          {/* MENU */}
          <div className="flex-1 overflow-y-auto py-4">
            <ul className={sidebarStyles.menuList.base}>
              {MENU_ITEMS.map(renderMenuItem)}
            </ul>
          </div>

          {/* FOOTER */}
          <div
            className={cn(
              sidebarStyles.footerContainer.base,
              isCollapsed
                ? sidebarStyles.footerContainer.collapsed
                : sidebarStyles.footerContainer.expanded
            )}
          >
            

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className={cn(
                sidebarStyles.logoutButton.base,
                isCollapsed &&
                  sidebarStyles.logoutButton.collapsed
              )}
            >
              <LogOut
                size={20}
                className="text-gray-500"
              />

              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* ================= MOBILE MENU BUTTON ================= */}

      <motion.button
        onClick={() =>
          setMobileOpen((prev) => !prev)
        }
        className={sidebarStyles.mobileMenuButton}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {mobileOpen ? (
          <X size={24} />
        ) : (
          <Menu size={24} />
        )}
      </motion.button>

      {/* ================= MOBILE SIDEBAR ================= */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={sidebarStyles.mobileOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* BACKDROP */}
            <motion.div
              className={sidebarStyles.mobileBackdrop}
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* MOBILE SIDEBAR */}
            <motion.div
              ref={sidebarRef}
              className={sidebarStyles.mobileSidebar.base}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
              }}
            >
              <div className="relative h-full flex flex-col">

                {/* MOBILE HEADER */}
                <div
                  className={
                    sidebarStyles.mobileHeader
                  }
                >
                  <div
                    className={
                      sidebarStyles.mobileUserContainer
                    }
                  >
                    <div
                      className={
                        sidebarStyles.userInitials.base
                      }
                    >
                      {initials}
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {username}
                      </h2>

                      <p className="text-sm text-gray-500">
                        {email}
                      </p>
                    </div>
                  </div>

                  {/* CLOSE BUTTON */}
                  <button
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={
                      sidebarStyles.mobileCloseButton
                    }
                  >
                    <X
                      size={24}
                      className="text-gray-600"
                    />
                  </button>
                </div>

                {/* MOBILE MENU */}
                <div className="flex-1 overflow-y-auto py-4">
                  <ul
                    className={
                      sidebarStyles.mobileMenuList
                    }
                  >
                    {MENU_ITEMS.map(
                      ({ text, path, icon }) => (
                        <motion.li
                          key={text}
                          whileTap={{
                            scale: 0.98,
                          }}
                        >
                          <Link
                            to={path}
                            onClick={() =>
                              setMobileOpen(false)
                            }
                            className={cn(
                              sidebarStyles.mobileMenuItem
                                .base,
                              pathname === path
                                ? sidebarStyles.mobileMenuItem
                                    .active
                                : sidebarStyles.mobileMenuItem
                                    .inactive
                            )}
                          >
                            <span
                              className={
                                pathname === path
                                  ? sidebarStyles.menuIcon
                                      .active
                                  : sidebarStyles.menuIcon
                                      .inactive
                              }
                            >
                              {icon}
                            </span>

                            <span>{text}</span>
                          </Link>
                        </motion.li>
                      )
                    )}
                  </ul>
                </div>

                {/* MOBILE FOOTER */}
                <div
                  className={
                    sidebarStyles.mobileFooter
                  }
                >
                 
                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className={
                      sidebarStyles.mobileLogoutButton
                    }
                  >
                    <LogOut
                      size={20}
                      className="text-gray-500"
                    />

                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;