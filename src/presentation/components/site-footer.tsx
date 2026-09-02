export function SiteFooter() {
  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted print:hidden">
      © {new Date().getFullYear()}{" "}
      <a href="https://riadh-mnasri.pro" className="hover:underline">
        Riadh MNASRI
      </a>
    </footer>
  );
}
