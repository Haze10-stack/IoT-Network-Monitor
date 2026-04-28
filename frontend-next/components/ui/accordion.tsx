"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  value: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ value, title, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors duration-200 hover:text-foreground/80"
      >
        <span className="text-lg font-medium text-foreground">{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-4 flex h-5 w-5 items-center justify-center"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-base text-muted-foreground leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AccordionProps {
  items: { value: string; title: string; content: string }[];
  defaultValue?: string;
}

export function Accordion({ items, defaultValue }: AccordionProps) {
  const [openValue, setOpenValue] = React.useState(defaultValue || items[0]?.value);

  return (
    <div className="w-full">
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          title={item.title}
          isOpen={openValue === item.value}
          onToggle={() => setOpenValue(openValue === item.value ? "" : item.value)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}