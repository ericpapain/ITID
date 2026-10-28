import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Table as TableIcon,
  Image as ImageIcon,
  Code,
  Eye,
  Undo,
  Redo,
  Plus,
  Trash2,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Palette,
  Layers,
  Type
} from "lucide-react";
import { RichContentRenderer } from "../components/ui/RichContentRenderer";
import { SectionImportModal, ImportedSectionData } from "./SectionImportModal";

interface RichContentEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

export function RichContentEditor({
  value,
  onChange,
  label,
  placeholder = "Rédigez ou collez votre contenu ici...",
  minHeight = "220px",
}: RichContentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "html" | "preview">("visual");

  // State for modals
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHasHeader, setTableHasHeader] = useState(true);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCategory, setLinkCategory] = useState<"traitement" | "pathologie" | "cas_clinique" | "article" | "page" | "external">("traitement");
  const [linkTargetSlug, setLinkTargetSlug] = useState("");
  const [linkCustomUrl, setLinkCustomUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(false);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSectionImportModal, setShowSectionImportModal] = useState(false);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  const FONT_FAMILIES = [
    { label: "Police standard", value: "inherit" },
    { label: "Inter (Moderne & Net)", value: "'Inter', system-ui, sans-serif" },
    { label: "Outfit (Titres & Prestige)", value: "'Outfit', sans-serif" },
    { label: "Lora (Éditorial ITID)", value: "'Lora', Georgia, serif" },
    { label: "Playfair Display (Élégant)", value: "'Playfair Display', Georgia, serif" },
    { label: "Merriweather (Sérif Lecture)", value: "'Merriweather', serif" },
    { label: "JetBrains Mono (Technique)", value: "'JetBrains Mono', monospace" },
    { label: "Arial (Standard)", value: "Arial, sans-serif" },
    { label: "Georgia (Classique)", value: "Georgia, serif" },
  ];

  const FONT_SIZES = [
    { label: "11px - Très petite", value: "11px" },
    { label: "12px - Légende", value: "12px" },
    { label: "13px - Petite", value: "13px" },
    { label: "14px - Compacte", value: "14px" },
    { label: "15px - Normale", value: "15px" },
    { label: "16px - Aérée", value: "16px" },
    { label: "18px - Grande", value: "18px" },
    { label: "20px - Très grande", value: "20px" },
    { label: "24px - Sous-titre H3", value: "24px" },
    { label: "28px - Titre H2", value: "28px" },
    { label: "32px - Titre H1", value: "32px" },
    { label: "36px - Titre Majeur", value: "36px" },
  ];

  // Available CMS items for linking
  const [traitementsList, setTraitementsList] = useState<{ slug: string; title: string }[]>([]);
  const [pathologiesList, setPathologiesList] = useState<{ slug: string; title: string }[]>([]);
  const [casCliniquesList, setCasCliniquesList] = useState<{ id: number; title: string; treatment_slug?: string }[]>([]);
  const [articlesList, setArticlesList] = useState<{ slug: string; title: string }[]>([]);

  // Fetch CMS items once for intelligent link picker
  useEffect(() => {
    let isMounted = true;
    const fetchEntities = async () => {
      try {
        const [resT, resP, resC, resA] = await Promise.allSettled([
          fetch("/api/cms/traitements").then((r) => r.json()),
          fetch("/api/cms/pathologies").then((r) => r.json()),
          fetch("/api/cms/cas_cliniques").then((r) => r.json()),
          fetch("/api/cms/articles").then((r) => r.json()),
        ]);

        if (isMounted) {
          if (resT.status === "fulfilled" && resT.value?.traitements) {
            setTraitementsList(
              resT.value.traitements.map((t: any) => ({
                slug: t.slug,
                title: t.title_fr || t.title_en || t.slug,
              }))
            );
          }
          if (resP.status === "fulfilled" && resP.value?.pathologies) {
            setPathologiesList(
              resP.value.pathologies.map((p: any) => ({
                slug: p.slug,
                title: p.title_fr || p.title_en || p.slug,
              }))
            );
          }
          if (resC.status === "fulfilled" && resC.value?.items) {
            setCasCliniquesList(
              resC.value.items.map((c: any) => ({
                id: c.id,
                title: c.title_fr || c.title_en,
                treatment_slug: c.traitement_slug,
              }))
            );
          }
          if (resA.status === "fulfilled" && resA.value?.articles) {
            setArticlesList(
              resA.value.articles.map((a: any) => ({
                slug: a.slug,
                title: a.title_fr || a.title_en || a.slug,
              }))
            );
          }
        }
      } catch {}
    };

    fetchEntities();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync internal editor HTML when value prop changes from outside (and not focused)
  useEffect(() => {
    if (editorRef.current && activeTab === "visual") {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, activeTab]);

  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0));
    }
  };

  const restoreSavedSelection = () => {
    if (savedSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelection);
      }
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html === "<p><br></p>" || html === "<br>" ? "" : html);
    }
  };

  const exec = (command: string, arg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  const applyHeading = (tag: string) => {
    if (tag === "p") {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    handleEditorInput();
  };

  const applyTextColor = (colorHex: string) => {
    restoreSavedSelection();
    exec("foreColor", colorHex);
    setShowColorPicker(false);
  };

  const applyFontFamily = (family: string) => {
    restoreSavedSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      document.execCommand("fontName", false, family);
    } else {
      const span = document.createElement("span");
      span.style.fontFamily = family;
      try {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
      } catch {
        document.execCommand("fontName", false, family);
      }
    }
    handleEditorInput();
  };

  const applyTextSize = (sizePx: string) => {
    restoreSavedSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      document.execCommand("fontSize", false, "3");
    } else {
      const span = document.createElement("span");
      span.style.fontSize = sizePx;
      try {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
      } catch {
        document.execCommand("fontSize", false, "3");
      }
    }
    handleEditorInput();
  };

  const handleImportSectionIntoEditor = (sec: ImportedSectionData) => {
    restoreSavedSelection();
    const title = sec.title_fr || sec.title || "";
    const text = sec.text_fr || sec.text || "";
    const badge = sec.badge || "";
    const image = sec.image || "";

    const html = `
<div class="my-5 p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm space-y-3" data-imported-section="true">
  ${badge ? `<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30">${badge}</span>` : ""}
  ${title ? `<h3 class="text-lg md:text-xl font-bold text-white mt-1">${title}</h3>` : ""}
  ${image ? `<div class="rounded-xl overflow-hidden my-3 max-h-72 border border-white/10"><img src="${image}" alt="${title}" class="w-full h-full object-cover" /></div>` : ""}
  <div class="text-sm leading-relaxed text-slate-200">${text}</div>
</div><p><br></p>`;

    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand("insertHTML", false, html);
    handleEditorInput();
    setShowSectionImportModal(false);
  };

  // -------------------------------------------------------------
  // Insertion de Tableau
  // -------------------------------------------------------------
  const handleInsertTable = () => {
    restoreSavedSelection();
    const rows = Math.max(1, tableRows);
    const cols = Math.max(1, tableCols);

    let html = `<div class="table-responsive-wrapper my-4"><table class="w-full text-left border-collapse" data-itid-table="true">`;

    if (tableHasHeader) {
      html += `<thead><tr class="bg-cyan-950/60 text-cyan-300 font-bold border-b border-white/20">`;
      for (let c = 1; c <= cols; c++) {
        html += `<th class="p-3 border border-white/10">En-tête ${c}</th>`;
      }
      html += `</tr></thead>`;
    }

    html += `<tbody>`;
    for (let r = 1; r <= rows; r++) {
      html += `<tr class="hover:bg-white/5 border-b border-white/10">`;
      for (let c = 1; c <= cols; c++) {
        html += `<td class="p-3 border border-white/10">Cellule ${r}-${c}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table></div><p><br></p>`;

    document.execCommand("insertHTML", false, html);
    handleEditorInput();
    setShowTableModal(false);
  };

  // Actions de tableau (ajouter ligne, supprimer ligne, etc.)
  const handleTableAction = (action: "add_row" | "del_row" | "add_col" | "del_col" | "remove_table") => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode;
    const table = (node instanceof HTMLElement ? node : node?.parentElement)?.closest("table");
    if (!table) return;

    if (action === "remove_table") {
      const wrapper = table.closest(".table-responsive-wrapper") || table;
      wrapper.remove();
      handleEditorInput();
      return;
    }

    const currentCell = (node instanceof HTMLElement ? node : node?.parentElement)?.closest("td, th");
    const currentRow = currentCell?.closest("tr");

    if (action === "add_row" && currentRow) {
      const colCount = currentRow.children.length;
      const newRow = document.createElement("tr");
      newRow.className = "hover:bg-white/5 border-b border-white/10";
      for (let i = 0; i < colCount; i++) {
        const td = document.createElement("td");
        td.className = "p-3 border border-white/10";
        td.textContent = "Nouvelle cellule";
        newRow.appendChild(td);
      }
      currentRow.after(newRow);
    } else if (action === "del_row" && currentRow) {
      currentRow.remove();
    } else if (action === "add_col") {
      const colIndex = currentCell ? Array.from(currentCell.parentElement!.children).indexOf(currentCell) : 0;
      table.querySelectorAll("tr").forEach((row) => {
        const isHeader = row.parentElement?.tagName.toLowerCase() === "thead";
        const cell = document.createElement(isHeader ? "th" : "td");
        cell.className = isHeader
          ? "p-3 border border-white/10 bg-cyan-950/60 text-cyan-300 font-bold"
          : "p-3 border border-white/10";
        cell.textContent = isHeader ? "Nouvelle Col" : "Donnée";
        const target = row.children[colIndex];
        if (target) {
          target.after(cell);
        } else {
          row.appendChild(cell);
        }
      });
    } else if (action === "del_col" && currentCell) {
      const colIndex = Array.from(currentCell.parentElement!.children).indexOf(currentCell);
      table.querySelectorAll("tr").forEach((row) => {
        if (row.children[colIndex]) {
          row.children[colIndex].remove();
        }
      });
    }

    handleEditorInput();
  };

  // -------------------------------------------------------------
  // Insertion de Lien Interne ou Externe Intelligent
  // -------------------------------------------------------------
  const openLinkModal = () => {
    saveCurrentSelection();
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : "";
    setLinkText(text);

    // Default target
    if (traitementsList.length > 0 && !linkTargetSlug) {
      setLinkTargetSlug(traitementsList[0].slug);
    }
    setShowLinkModal(true);
  };

  const handleInsertLink = () => {
    restoreSavedSelection();

    let href = "";
    let displayText = linkText;
    let isInternal = true;

    if (linkCategory === "traitement") {
      href = `/traitements/${linkTargetSlug || "infiltrations-rachidiennes"}`;
      const found = traitementsList.find((t) => t.slug === linkTargetSlug);
      if (!displayText) displayText = found ? found.title : "Voir le traitement";
    } else if (linkCategory === "pathologie") {
      href = `/pathologies/${linkTargetSlug || "lombalgie-chronique"}`;
      const found = pathologiesList.find((p) => p.slug === linkTargetSlug);
      if (!displayText) displayText = found ? found.title : "Voir la pathologie";
    } else if (linkCategory === "cas_clinique") {
      const found = casCliniquesList.find((c) => c.id.toString() === linkTargetSlug);
      if (found && found.treatment_slug) {
        href = `/traitements/${found.treatment_slug}`;
      } else {
        href = `/#projets`;
      }
      if (!displayText) displayText = found ? found.title : "Cas clinique associé";
    } else if (linkCategory === "article") {
      href = `/actualites/${linkTargetSlug || "nouvelle-approche-neuromodulation"}`;
      const found = articlesList.find((a) => a.slug === linkTargetSlug);
      if (!displayText) displayText = found ? found.title : "Lire l'actualité";
    } else if (linkCategory === "page") {
      href = linkTargetSlug || "/";
      if (!displayText) displayText = "Accéder à la page";
    } else if (linkCategory === "external") {
      href = linkCustomUrl || "https://";
      isInternal = false;
      if (!displayText) displayText = href;
    }

    const targetAttr = isInternal ? "" : linkOpenNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
    const internalAttr = isInternal ? ' data-internal="true"' : "";
    const linkHtml = `<a href="${href}"${internalAttr}${targetAttr} class="text-[#48cae4] hover:underline font-semibold cursor-pointer">${displayText}</a>&nbsp;`;

    document.execCommand("insertHTML", false, linkHtml);
    handleEditorInput();
    setShowLinkModal(false);
  };

  const colorPalette = [
    { label: "Blanc", hex: "#ffffff" },
    { label: "Cyan Lumineux (ITID)", hex: "#48cae4" },
    { label: "Teal Médical (ITID)", hex: "#2a9d8f" },
    { label: "Turquoise Clair", hex: "#3bb5a6" },
    { label: "Jaune Or", hex: "#e9c46a" },
    { label: "Orange Doux", hex: "#f4a261" },
    { label: "Corail Alerte", hex: "#e76f51" },
    { label: "Gris Argent", hex: "#94a3b8" },
  ];

  return (
    <div className="space-y-2 text-xs">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-slate-300 font-semibold">{label}</label>
          <span className="text-[11px] text-[#48cae4] font-medium">Éditeur enrichi ITID</span>
        </div>
      )}

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl focus-within:border-[#2a9d8f] transition-all">
        {/* Onglets de Mode (Visuel / Code HTML / Prévisualisation) */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("visual")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "visual"
                  ? "bg-[#2a9d8f] text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Eye size={13} />
              <span>Visuel (WYSIWYG)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("html")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "html"
                  ? "bg-[#2a9d8f] text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Code size={13} />
              <span>Code Source HTML</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "preview"
                  ? "bg-[#2a9d8f] text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>👁️ Aperçu Fini</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:inline">
            Tableaux, liens internes & styles supportés
          </div>
        </div>

        {/* Barre d'outils WYSIWYG (uniquement en mode visuel) */}
        {activeTab === "visual" && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-900 border-b border-slate-800 text-slate-300">
            {/* Annuler / Rétablir */}
            <button
              type="button"
              onClick={() => exec("undo")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors cursor-pointer"
              title="Annuler (Ctrl+Z)"
            >
              <Undo size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec("redo")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors cursor-pointer"
              title="Rétablir (Ctrl+Y)"
            >
              <Redo size={14} />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Titres & Blocs */}
            <select
              onChange={(e) => applyHeading(e.target.value)}
              defaultValue="p"
              className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs outline-none cursor-pointer"
            >
              <option value="p">Texte normal (Paragraphe)</option>
              <option value="h1">Titre principal (H1)</option>
              <option value="h2">Titre de section (H2)</option>
              <option value="h3">Sous-titre (H3)</option>
            </select>

            {/* Polices de caractères */}
            <select
              onMouseDown={saveCurrentSelection}
              onChange={(e) => applyFontFamily(e.target.value)}
              defaultValue="inherit"
              className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs outline-none cursor-pointer"
              title="Police de caractères"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value !== "inherit" ? f.value : undefined }}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* Tailles de police */}
            <select
              onMouseDown={saveCurrentSelection}
              onChange={(e) => applyTextSize(e.target.value)}
              defaultValue="15px"
              className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs outline-none cursor-pointer"
              title="Taille de la police"
            >
              {FONT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Gras, Italique, Souligné, Barré */}
            <button
              type="button"
              onClick={() => exec("bold")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors font-bold cursor-pointer"
              title="Gras (Ctrl+B)"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec("italic")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors italic cursor-pointer"
              title="Italique (Ctrl+I)"
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec("underline")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors underline cursor-pointer"
              title="Souligné (Ctrl+U)"
            >
              <Underline size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec("strikeThrough")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors line-through cursor-pointer"
              title="Barré"
            >
              <Strikethrough size={14} />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Couleur de texte */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  saveCurrentSelection();
                  setShowColorPicker(!showColorPicker);
                }}
                className="p-1.5 hover:bg-slate-800 hover:text-[#48cae4] rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Couleur du texte"
              >
                <Palette size={14} />
                <ChevronDown size={10} />
              </button>

              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 w-44 grid grid-cols-4 gap-1.5">
                  {colorPalette.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => applyTextColor(c.hex)}
                      title={c.label}
                      style={{ backgroundColor: c.hex }}
                      className="w-8 h-8 rounded-lg border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Alignement */}
            <button
              type="button"
              onClick={() => exec("justifyLeft")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors cursor-pointer"
              title="Aligner à gauche"
            >
              <AlignLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec("justifyCenter")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors cursor-pointer"
              title="Centrer"
            >
              <AlignCenter size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec("justifyRight")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors cursor-pointer"
              title="Aligner à droite"
            >
              <AlignRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec("justifyFull")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors cursor-pointer"
              title="Justifier"
            >
              <AlignJustify size={14} />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Listes & Citation */}
            <button
              type="button"
              onClick={() => exec("insertUnorderedList")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors cursor-pointer"
              title="Liste à puces"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec("insertOrderedList")}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors cursor-pointer"
              title="Liste numérotée"
            >
              <ListOrdered size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("formatBlock", false, "<blockquote>");
                handleEditorInput();
              }}
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors cursor-pointer"
              title="Citation en encadré"
            >
              <Quote size={14} />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Liens Intelligents */}
            <button
              type="button"
              onClick={openLinkModal}
              className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 font-semibold cursor-pointer"
              title="Créer un lien interne vers un traitement, une pathologie..."
            >
              <LinkIcon size={13} />
              <span>Lien interne / Web</span>
            </button>

            {/* Tableaux */}
            <button
              type="button"
              onClick={() => {
                saveCurrentSelection();
                setShowTableModal(true);
              }}
              className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 font-semibold cursor-pointer"
              title="Insérer un tableau structuré"
            >
              <TableIcon size={13} />
              <span>Tableau</span>
            </button>

            {/* Importer Section */}
            <button
              type="button"
              onClick={() => {
                saveCurrentSelection();
                setShowSectionImportModal(true);
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-teal-950/70 to-emerald-950/70 hover:from-teal-900 hover:to-emerald-900 border border-[#2a9d8f]/50 text-[#48cae4] hover:text-white rounded-lg transition-all flex items-center gap-1.5 font-semibold cursor-pointer shadow-sm"
              title="Importer et insérer une section complète d'un article, traitement ou pathologie"
            >
              <Layers size={13} />
              <span>📥 Importer Section</span>
            </button>

            {/* Menu contextuel rapide si tableau sélectionné */}
            <div className="flex items-center gap-1 ml-auto text-[10px]">
              <span className="text-slate-400">Actions tableau :</span>
              <button
                type="button"
                onClick={() => handleTableAction("add_row")}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                title="Ajouter une ligne au tableau cliqué"
              >
                + Ligne
              </button>
              <button
                type="button"
                onClick={() => handleTableAction("del_row")}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                title="Supprimer la ligne courante"
              >
                - Ligne
              </button>
              <button
                type="button"
                onClick={() => handleTableAction("add_col")}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                title="Ajouter une colonne"
              >
                + Col
              </button>
              <button
                type="button"
                onClick={() => handleTableAction("del_col")}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                title="Supprimer la colonne"
              >
                - Col
              </button>
              <button
                type="button"
                onClick={() => handleTableAction("remove_table")}
                className="px-1.5 py-0.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded"
                title="Supprimer entièrement le tableau"
              >
                🗑️ Suppr
              </button>
            </div>
          </div>
        )}

        {/* Corps de l'éditeur selon le mode */}
        <div className="p-4" style={{ minHeight }}>
          {activeTab === "visual" && (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onBlur={handleEditorInput}
              data-placeholder={placeholder}
              className="w-full text-slate-200 outline-none leading-relaxed rich-content-container focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600 empty:before:pointer-events-none"
              style={{ minHeight: "180px" }}
            />
          )}

          {activeTab === "html" && (
            <textarea
              rows={10}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-slate-950 font-mono text-xs text-emerald-300 p-3 rounded-lg outline-none border border-slate-800 focus:border-[#48cae4] resize-y"
              placeholder="Code HTML du contenu..."
            />
          )}

          {activeTab === "preview" && (
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-[#48cae4] mb-3 uppercase tracking-wider">
                Rendu visuel réel tel qu'affiché aux visiteurs :
              </div>
              <RichContentRenderer content={value} />
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1 : CRÉATION DE TABLEAU                                  */}
      {/* ------------------------------------------------------------- */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <TableIcon size={18} className="text-emerald-400" />
                <span>Insérer un tableau structuré</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Nombre de lignes</label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Nombre de colonnes</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={tableHasHeader}
                onChange={(e) => setTableHasHeader(e.target.checked)}
                className="rounded accent-[#2a9d8f]"
              />
              <span>Inclure une ligne d'en-tête stylisée</span>
            </label>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Insérer le tableau</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2 : LIEN INTERNE INTELLIGENT / EXTERNE                   */}
      {/* ------------------------------------------------------------- */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <LinkIcon size={18} className="text-[#48cae4]" />
                <span>Insérer un lien intelligent ITID</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Choix du type de lien */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                Type de destination :
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLinkCategory("traitement")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    linkCategory === "traitement"
                      ? "bg-[#2a9d8f] border-[#48cae4] text-white shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  💉 Traitement
                </button>
                <button
                  type="button"
                  onClick={() => setLinkCategory("pathologie")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    linkCategory === "pathologie"
                      ? "bg-[#2a9d8f] border-[#48cae4] text-white shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  🩺 Pathologie
                </button>
                <button
                  type="button"
                  onClick={() => setLinkCategory("cas_clinique")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    linkCategory === "cas_clinique"
                      ? "bg-[#2a9d8f] border-[#48cae4] text-white shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  🔬 Cas Clinique
                </button>
                <button
                  type="button"
                  onClick={() => setLinkCategory("article")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    linkCategory === "article"
                      ? "bg-[#2a9d8f] border-[#48cae4] text-white shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  📰 Actualité
                </button>
                <button
                  type="button"
                  onClick={() => setLinkCategory("page")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    linkCategory === "page"
                      ? "bg-[#2a9d8f] border-[#48cae4] text-white shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  🏠 Page du site
                </button>
                <button
                  type="button"
                  onClick={() => setLinkCategory("external")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    linkCategory === "external"
                      ? "bg-slate-800 border-[#48cae4] text-cyan-300 shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  🌐 URL externe
                </button>
              </div>
            </div>

            {/* Sélecteur selon catégorie */}
            {linkCategory === "traitement" && (
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  Sélectionnez le traitement de destination :
                </label>
                <select
                  value={linkTargetSlug}
                  onChange={(e) => setLinkTargetSlug(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none font-medium"
                >
                  {traitementsList.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.title} (/traitements/{t.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {linkCategory === "pathologie" && (
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  Sélectionnez la pathologie de destination :
                </label>
                <select
                  value={linkTargetSlug}
                  onChange={(e) => setLinkTargetSlug(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none font-medium"
                >
                  {pathologiesList.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.title} (/pathologies/{p.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {linkCategory === "cas_clinique" && (
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  Sélectionnez le cas clinique (redirigera vers son traitement) :
                </label>
                <select
                  value={linkTargetSlug}
                  onChange={(e) => setLinkTargetSlug(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none font-medium"
                >
                  {casCliniquesList.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.title} (Traitement : {c.treatment_slug || "direct"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {linkCategory === "article" && (
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  Sélectionnez l'article de blog :
                </label>
                <select
                  value={linkTargetSlug}
                  onChange={(e) => setLinkTargetSlug(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none font-medium"
                >
                  {articlesList.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.title} (/actualites/{a.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {linkCategory === "page" && (
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  Sélectionnez la page interne :
                </label>
                <select
                  value={linkTargetSlug}
                  onChange={(e) => setLinkTargetSlug(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none font-medium"
                >
                  <option value="/">Page d'accueil (/)</option>
                  <option value="/traitements">Tous les traitements (/traitements)</option>
                  <option value="/pathologies">Toutes les pathologies (/pathologies)</option>
                  <option value="/actualites">Toutes les actualités (/actualites)</option>
                  <option value="/formations">Espace Formations (/formations)</option>
                  <option value="/ia">Assistant IA Diagnostic (/ia)</option>
                  <option value="/a-propos">À Propos & Équipe (/a-propos)</option>
                  <option value="/#contact">Section Contact & Rendez-vous (/#contact)</option>
                </select>
              </div>
            )}

            {linkCategory === "external" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    Adresse Web complète (URL) :
                  </label>
                  <input
                    type="url"
                    value={linkCustomUrl}
                    onChange={(e) => setLinkCustomUrl(e.target.value)}
                    placeholder="https://www.doctolib.fr/..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none font-mono"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkOpenNewTab}
                    onChange={(e) => setLinkOpenNewTab(e.target.checked)}
                    className="rounded accent-[#48cae4]"
                  />
                  <span>Ouvrir dans un nouvel onglet (_blank)</span>
                </label>
              </div>
            )}

            {/* Texte affiché */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">
                Texte à afficher pour ce lien :
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Ex: Découvrir notre traitement par radiofréquence..."
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Si laissé vide, l'intitulé officiel du contenu sélectionné sera utilisé automatiquement.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-lg shadow-cyan-900/30 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Créer le lien intelligent</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3 : INJECTION / IMPORT DE SECTION D'ARTICLE OU CONTENU */}
      <SectionImportModal
        isOpen={showSectionImportModal}
        onClose={() => setShowSectionImportModal(false)}
        onImport={handleImportSectionIntoEditor}
        title="Insérer le contenu d'une section"
        subtitle="Choisissez un article, une pathologie ou un traitement pour injecter une section dans votre texte."
      />
    </div>
  );
}
