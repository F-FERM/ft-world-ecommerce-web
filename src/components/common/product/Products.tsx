import type { StaticImageData } from "next/image";
import BlackTonerCartridge from "../../../../public/products/blacktonercartridge.png";
import PaperFeedRoller from "../../../../public/products/paperfeedroller.png";
import CyanTonerCartridge from "../../../../public/products/cyantonercartridge.png";
import PCR from "../../../../public/products/pcr.png";
import MagentaTonerCartridge from "../../../../public/products/magentatonercartridge.png";
import TransferBelt from "../../../../public/products/transferbelt.png";
import { Product } from "../ProductCard";

export interface ProductDetail extends Product {
  fullTitle: string;
  description: string;
  features: string[];
  gallery: StaticImageData[];
  inStock: boolean;
}

const tonerFeatures = [
  "Sharp output",
  "Deep color density",
  "High-yield performance",
  "Consistent print quality",
  "Ideal for high-volume printing",
  "Reliable compatibility",
];

const accessoryFeatures = [
  "Precision-made part",
  "Smooth paper handling",
  "Long service life",
  "Easy to install",
  "Ideal for high-volume printing",
  "Reliable compatibility",
];

export const PRODUCTS: ProductDetail[] = [
  {
    id: "p1",
    title: "Black Toner Cartiage",
    fullTitle: "Black Toner Cartridge C-EXV 36 (CEXV36)",
    description: "Black Toner Cartridge C-EXV 36 (CEXV36) 6055 / 6065 / 6075 / 6255 / 6265 / 6275",
    compatibleFor: "Compatible For Canon IR:",
    models: "4525i/ 4535i/ 4545i 4725 (CEXV53)",
    price: 100,
    oldPrice: 105,
    discount: 5,
    image: BlackTonerCartridge,
    gallery: [BlackTonerCartridge, BlackTonerCartridge, BlackTonerCartridge],
    features: tonerFeatures,
    inStock: true,
    category: "toner-cartridge",
  },
  {
    id: "p2",
    title: "Paper Feed Roller",
    fullTitle: "Paper Feed Roller (High Quality) 5235 / 2525",
    description: "Paper Feed Roller (High Quality) compatible for Canon 5235 / 2525",
    compatibleFor: "Compatible For Canon :",
    models: "5235/ 2525",
    price: 10,
    oldPrice: 15,
    discount: 5,
    image: PaperFeedRoller,
    gallery: [PaperFeedRoller, PaperFeedRoller, PaperFeedRoller],
    features: accessoryFeatures,
    inStock: true,
    category: "accessories",
  },
  {
    id: "p3",
    title: "Cyan Toner Cartiage",
    fullTitle: "Cyan Toner Cartridge NPG-65",
    description: "Cyan Toner Cartridge NPG-65 compatible for Canon IR 250i / 255 / 350i / 351fi",
    compatibleFor: "Compatible For Canon IR:",
    models: "250i/ 255/ 350i/ 351fi (NPG-65)",
    price: 96.43,
    oldPrice: 100,
    discount: 5,
    image: CyanTonerCartridge,
    gallery: [CyanTonerCartridge, CyanTonerCartridge, CyanTonerCartridge],
    features: tonerFeatures,
    inStock: true,
    category: "multicolor-toner",
  },
  {
    id: "p4",
    title: "Black Toner Cartiage",
    fullTitle: "Black Toner Cartridge NPG-65",
    description: "Black Toner Cartridge NPG-65 compatible for Canon IR 250i / 255 / 350i / 351fi",
    compatibleFor: "Compatible For Canon IR:",
    models: "250i/ 255/ 350i/ 351fi (NPG-65)",
    price: 96.43,
    oldPrice: 100,
    discount: 5,
    image: BlackTonerCartridge,
    gallery: [BlackTonerCartridge, BlackTonerCartridge, BlackTonerCartridge],
    features: tonerFeatures,
    inStock: true,
    category: "toner-cartridge",
  },
  {
    id: "p5",
    title: "PCR (Highyield)",
    fullTitle: "PCR (High Yield) 5535 / 5560 / 5550 / 5540 / 5750",
    description: "Primary Charging Roller (High Yield) compatible for Canon IRC 5535 / 5560 / 5550 / 5540 / 5750",
    compatibleFor: "Compatible For Canon IRC:",
    models: "5535/ 5560/ 5550/ 5540/ 5750",
    price: 35,
    oldPrice: 40,
    discount: 5,
    image: PCR,
    gallery: [PCR, PCR, PCR],
    features: accessoryFeatures,
    inStock: true,
    category: "accessories",
  },
  {
    id: "p6",
    title: "Magenta Toner Cartiage",
    fullTitle: "Magenta Toner Cartridge NPG-65",
    description: "Magenta Toner Cartridge NPG-65 compatible for Canon IRC 250i / 255 / 350i / 351fi",
    compatibleFor: "Compatible For Canon IRC:",
    models: "250i/ 255/ 350i/ 351fi (NPG-65)",
    price: 96.43,
    oldPrice: 100,
    discount: 5,
    image: MagentaTonerCartridge,
    gallery: [MagentaTonerCartridge, MagentaTonerCartridge, MagentaTonerCartridge],
    features: tonerFeatures,
    inStock: true,
    category: "multicolor-toner",
  },
  {
    id: "p7",
    title: "Black Toner Cartiage",
    fullTitle: "Black Toner Cartridge CEXV53",
    description: "Black Toner Cartridge CEXV53 compatible for Canon IR 4525i / 4535i / 4545i / 4725",
    compatibleFor: "Compatible For Canon IR:",
    models: "4525i/ 4535i/ 4545i 4725 (CEXV53)",
    price: 105,
    oldPrice: 120,
    discount: 5,
    image: BlackTonerCartridge,
    gallery: [BlackTonerCartridge, BlackTonerCartridge, BlackTonerCartridge],
    features: tonerFeatures,
    inStock: true,
    category: "toner-cartridge",
  },
  {
    id: "p8",
    title: "Transfer Belt",
    fullTitle: "Transfer Belt 3525 / 3530 / G65",
    description: "Transfer Belt compatible for Canon 3525 / 3530 / G65",
    compatibleFor: "Compatible For Canon :",
    models: "3525/ 3530/ G65",
    price: 8.57,
    oldPrice: 12.57,
    discount: 5,
    image: TransferBelt,
    gallery: [TransferBelt, TransferBelt, TransferBelt],
    features: accessoryFeatures,
    inStock: true,
    category: "accessories",
  },
];

export const getProductById = (id: string) => PRODUCTS.find((p) => p.id === id);

// Related = everything except the current product, same-category items first.
export const getRelatedProducts = (id: string) => {
  const current = getProductById(id);
  const others = PRODUCTS.filter((p) => p.id !== id);
  const sameCategory = others.filter((p) => p.category === current?.category);
  const rest = others.filter((p) => p.category !== current?.category);
  return [...sameCategory, ...rest];
};