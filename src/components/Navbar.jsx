import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FiMenu, FiX } from "react-icons/fi";

function Navbar() {

  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    // Initial check
    supabase.auth.getSession()
    .then(({ data: { session } }) => {
      setSignedIn(!!session);
    })
    .catch(err=>console.log(err))

    // Listen for login/logout
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSignedIn(!!session);
      }
    );
  }, []);


  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setSignedIn(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div
        className="
          mx-auto max-w-7xl flex justify-between items-center
          px-6 py-3 rounded-2xl
          bg-white/10 dark:bg-gray-900/20
          backdrop-blur-xl
          border border-white/20 dark:border-white/10
          shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
          transition-all duration-300
        "
      >
        {/* Logo */}
        <NavLink
          to="/"
          className="
            font-bold text-4xl tracking-tight select-none
            text-primary px-1 rounded-lg
            [text-shadow:_0_0_12px_hsl(var(--primary)/0.4),_0_0_24px_hsl(var(--primary)/0.2)]
            animate-glow-pulse
          "
        >
          Deb<span className="text-accent-foreground">Ai</span>
        </NavLink>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2 text-foreground/80">
          <NavLink to="/debates">
            <Button variant="outline" className="text-md">
              Debates
            </Button>
          </NavLink>
          <NavLink to="/debates">
            <Button variant="outline" className="text-md">
              New Debate
            </Button>
          </NavLink>
          {signedIn ? (
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <NavLink to="/auth">
              <Button variant="ghost" className="text-md">
                Sign In
              </Button>
            </NavLink>
          )}
        </div>

        {/* Hamburger Menu Button */}
        <Button
          className="sm:hidden text-2xl text-foreground/80"
          variant='outline'
          size='hide'
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border-t border-white/20 dark:border-white/10 px-6 py-4 flex flex-col gap-2">
          <NavLink
            to="/debates"
            onClick={() => setMenuOpen(false)}
          >
            <Button variant="outline" className="w-full text-md">
              Debates
            </Button>
          </NavLink>
          <NavLink
            to="/debates"
            onClick={() => setMenuOpen(false)}
          >
            <Button variant="outline" className="w-full text-md">
              New Debate
            </Button>
          </NavLink>
          {signedIn ? (
            <Button
              variant="destructive"
              onClick={() => {
                handleSignOut();
                setMenuOpen(false);
              }}
              className="w-full"
            >
              Sign Out
            </Button>
          ) : (
            <NavLink
              to="/auth"
              onClick={() => setMenuOpen(false)}
            >
              <Button variant="ghost" className="w-full text-md">
                Sign In
              </Button>
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;