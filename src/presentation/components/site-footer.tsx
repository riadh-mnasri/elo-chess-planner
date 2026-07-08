export function SiteFooter() {
  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted print:hidden">
      © {new Date().getFullYear()} Riadh MNASRI
    </footer>
  );
}
