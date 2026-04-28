import Link from "next/link";

const items = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/object", label: "Structured Output" },
  { href: "/tools", label: "Tool Calling" },
];

export function Nav() {
  return (
    <nav className="nav">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="nav-link">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
