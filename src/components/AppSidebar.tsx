import { useState } from "react";
import {
  X,
  Menu,
  Image,
  SlidersHorizontal,
  Save,
  Maximize2,
  Crop,
  FolderOpen,
  MessageSquareHeart,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  onItemClick: (item: string) => void;
}

const menuItems = [
  { id: "collage", icon: Image, label: "Collage" },
  { id: "filter", icon: SlidersHorizontal, label: "Filter" },
  { id: "save", icon: Save, label: "Save" },
  { id: "resize", icon: Maximize2, label: "Resize" },
  { id: "crop", icon: Crop, label: "Crop" },
  { id: "converter", icon: FolderOpen, label: "Converter" },
  { id: "feedback", icon: MessageSquareHeart, label: "Feedback" },
];

const socialLinks = [
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const AppSidebar = ({ isOpen, onClose, activeItem, onItemClick }: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-sidebar border-r border-border z-50 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h1 className="text-2xl font-light tracking-wide">
            <span className="text-foreground">Pic </span>
            <span className="text-primary">Perfect</span>
          </h1>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li
                key={item.id}
                className="opacity-0 animate-slide-in-left"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`sidebar-link w-full ${
                    activeItem === item.id ? "active" : ""
                  }`}
                >
                  <item.icon className="sidebar-icon text-primary" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social Links */}
        <div className="px-6 py-6 border-t border-border">
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
