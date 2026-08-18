import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Plus, 
  Trash2, 
  Copy, 
  Sliders, 
  Tag, 
  Check, 
  AlertCircle, 
  Move, 
  Type, 
  Barcode as BarcodeIcon, 
  Image as ImageIcon, 
  Layers,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { LabelTemplate, LabelTemplateElement, StoreItem } from '../types';

interface LabelDesignerProps {
  templates: LabelTemplate[];
  items: StoreItem[];
  onSaveTemplate: (template: LabelTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onSetDefaultTemplate: (templateId: string) => void;
}

export const LabelDesignerView: React.FC<LabelDesignerProps> = ({
  templates,
  items,
  onSaveTemplate,
  onDeleteTemplate,
  onSetDefaultTemplate
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [previewItemId, setPreviewItemId] = useState<string>(items[0]?.id || '');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'batchPrint'>('editor');
  
  // Batch print quantities map: { [itemId]: quantity }
  const [printQuantities, setPrintQuantities] = useState<{ [itemId: string]: number }>({
    [items[0]?.id || '']: 10,
    [items[1]?.id || '']: 5,
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const printBarcodeRefs = useRef<{ [key: string]: SVGSVGElement | null }>({});

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const previewItem = items.find(i => i.id === previewItemId) || items[0];

  // Render Barcode SVG onto preview canvas when template or item changes
  useEffect(() => {
    if (barcodeRef.current && previewItem) {
      try {
        JsBarcode(barcodeRef.current, previewItem.barcode || '8901234567890', {
          format: 'CODE128',
          width: 1.4,
          height: 28,
          displayValue: true,
          fontSize: 10,
          margin: 0,
          font: 'monospace'
        });
      } catch (err) {
        console.warn('Barcode render error:', err);
      }
    }
  }, [previewItem, currentTemplate, selectedTemplateId]);

  // Update element position or attributes
  const updateElement = (elementId: string, updates: Partial<LabelTemplateElement>) => {
    if (!currentTemplate) return;
    const updatedElements = currentTemplate.elements.map(el => {
      if (el.id === elementId) {
        return { ...el, ...updates };
      }
      return el;
    });

    onSaveTemplate({
      ...currentTemplate,
      elements: updatedElements,
      updatedAt: new Date().toISOString()
    });
  };

  const selectedElement = currentTemplate?.elements.find(el => el.id === selectedElementId);

  // Add new element to canvas
  const handleAddElement = (type: LabelTemplateElement['type']) => {
    if (!currentTemplate) return;
    const newEl: LabelTemplateElement = {
      id: `el_${Date.now()}`,
      type,
      label: type === 'customText' ? 'Custom Text' : type,
      x: 50,
      y: 50,
      fontSize: 10,
      fontWeight: 'normal',
      textAlign: 'center',
      customText: type === 'customText' ? 'YOUR TEXT HERE' : undefined,
      visible: true
    };

    onSaveTemplate({
      ...currentTemplate,
      elements: [...currentTemplate.elements, newEl],
      updatedAt: new Date().toISOString()
    });
    setSelectedElementId(newEl.id);
  };

  // Remove element
  const handleRemoveElement = (elementId: string) => {
    if (!currentTemplate) return;
    onSaveTemplate({
      ...currentTemplate,
      elements: currentTemplate.elements.filter(el => el.id !== elementId),
      updatedAt: new Date().toISOString()
    });
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  // Handle template dimension changes
  const handleDimensionChange = (widthMm: number, heightMm: number) => {
    if (!currentTemplate) return;
    onSaveTemplate({
      ...currentTemplate,
      widthMm,
      heightMm,
      updatedAt: new Date().toISOString()
    });
  };

  // Create duplicate template
  const handleDuplicateTemplate = () => {
    if (!currentTemplate) return;
    const newTpl: LabelTemplate = {
      ...currentTemplate,
      id: `tpl_${Date.now()}`,
      name: `${currentTemplate.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSaveTemplate(newTpl);
    setSelectedTemplateId(newTpl.id);
  };

  // Create brand new blank template
  const handleCreateNewTemplate = () => {
    const newTpl: LabelTemplate = {
      id: `tpl_${Date.now()}`,
      name: 'Custom Label 50x25mm',
      widthMm: 50,
      heightMm: 25,
      isDefault: false,
      elements: [
        {
          id: 'el_title',
          type: 'itemName',
          label: 'Product Title',
          x: 50,
          y: 20,
          fontSize: 10,
          fontWeight: 'bold',
          textAlign: 'center',
          visible: true
        },
        {
          id: 'el_barcode',
          type: 'barcode',
          label: 'Barcode',
          x: 50,
          y: 55,
          fontSize: 9,
          fontWeight: 'normal',
          textAlign: 'center',
          barcodeFormat: 'CODE128',
          height: 24,
          visible: true
        },
        {
          id: 'el_price',
          type: 'price',
          label: 'Price',
          x: 50,
          y: 88,
          fontSize: 12,
          fontWeight: '800',
          textAlign: 'center',
          prefix: '₹ ',
          visible: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSaveTemplate(newTpl);
    setSelectedTemplateId(newTpl.id);
  };

  // Native Browser Print Trigger for thermal roll
  const triggerNativePrint = () => {
    window.print();
  };

  // Render text for given element type from sample preview item
  const getElementDisplayValue = (el: LabelTemplateElement) => {
    if (!previewItem) return el.label;
    switch (el.type) {
      case 'itemName':
        return previewItem.name;
      case 'price':
        return `${el.prefix || '₹ '}${previewItem.sellingPrice.toLocaleString('en-IN')}${el.suffix || ''}`;
      case 'mrp':
        return `MRP: ₹${previewItem.mrp.toLocaleString('en-IN')}`;
      case 'sku':
        return `SKU: ${previewItem.sku}`;
      case 'variant':
        return previewItem.sizeOrVariant || 'Standard';
      case 'customText':
        return el.customText || 'Custom Text';
      case 'storeLogo':
        return '🏬 [LOGO]';
      default:
        return el.label;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-tab navigation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Barcode & Price Tag Label Designer</h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
              WYSIWYG Canvas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Design direct-thermal adhesive tags (40×25mm, 50×25mm, 50×30mm) with auto-generated Code128 barcodes from Zoho SKU.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('editor')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎨 Visual Editor
          </button>
          <button
            onClick={() => setActiveSubTab('batchPrint')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'batchPrint' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🖨️ Batch Print Catalog
          </button>
        </div>
      </div>

      {activeSubTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Template Selection & Controls (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Template Selector Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Templates</label>
                <button
                  onClick={handleCreateNewTemplate}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-md flex items-center space-x-1 text-xs font-semibold"
                  title="Create New Template"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setSelectedElementId(null);
                    }}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      tpl.id === currentTemplate.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">{tpl.name}</span>
                      {tpl.isDefault && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>{tpl.widthMm}mm × {tpl.heightMm}mm</span>
                      <span>{tpl.elements.length} elements</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Template Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={handleDuplicateTemplate}
                  className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>

                {!currentTemplate.isDefault && (
                  <button
                    onClick={() => onSetDefaultTemplate(currentTemplate.id)}
                    className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium"
                  >
                    Set Default
                  </button>
                )}

                {templates.length > 1 && (
                  <button
                    onClick={() => setConfirmDeleteId(currentTemplate.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Label Dimensions Preset Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Dimensions (mm)</label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDimensionChange(50, 25)}
                  className={`p-2 rounded-lg border text-xs text-center font-medium ${
                    currentTemplate.widthMm === 50 && currentTemplate.heightMm === 25
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  50mm × 25mm
                  <span className="block text-[10px] text-slate-400">Standard Apparel</span>
                </button>

                <button
                  onClick={() => handleDimensionChange(40, 25)}
                  className={`p-2 rounded-lg border text-xs text-center font-medium ${
                    currentTemplate.widthMm === 40 && currentTemplate.heightMm === 25
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  40mm × 25mm
                  <span className="block text-[10px] text-slate-400">Accessories</span>
                </button>

                <button
                  onClick={() => handleDimensionChange(50, 30)}
                  className={`p-2 rounded-lg border text-xs text-center font-medium ${
                    currentTemplate.widthMm === 50 && currentTemplate.heightMm === 30
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  50mm × 30mm
                  <span className="block text-[10px] text-slate-400">Gourmet / Shelf</span>
                </button>

                <button
                  onClick={() => handleDimensionChange(60, 40)}
                  className={`p-2 rounded-lg border text-xs text-center font-medium ${
                    currentTemplate.widthMm === 60 && currentTemplate.heightMm === 40
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  60mm × 40mm
                  <span className="block text-[10px] text-slate-400">Large Carton</span>
                </button>
              </div>

              {/* Custom mm Inputs */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={currentTemplate.widthMm}
                    onChange={(e) => handleDimensionChange(parseInt(e.target.value) || 50, currentTemplate.heightMm)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Height (mm)</label>
                  <input
                    type="number"
                    value={currentTemplate.heightMm}
                    onChange={(e) => handleDimensionChange(currentTemplate.widthMm, parseInt(e.target.value) || 25)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Elements Layer Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Canvas Elements</label>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleAddElement('customText')}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                    title="Add Custom Text"
                  >
                    <Type className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAddElement('mrp')}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                    title="Add MRP Element"
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {currentTemplate.elements.map((el) => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedElementId(el.id)}
                    className={`flex items-center justify-between p-2 rounded-md text-xs cursor-pointer ${
                      selectedElementId === el.id
                        ? 'bg-indigo-100 text-indigo-900 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {el.type === 'barcode' ? (
                        <BarcodeIcon className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <Type className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span className="truncate">{el.label}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveElement(el.id);
                      }}
                      className="text-slate-400 hover:text-red-500 p-0.5"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: Interactive WYSIWYG Canvas (6 cols) */}
          <div className="lg:col-span-6 space-y-4 flex flex-col items-center">
            {/* Live Sample Product Picker */}
            <div className="w-full bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-700">Preview Data Source:</span>
              </div>
              <select
                value={previewItemId}
                onChange={(e) => setPreviewItemId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 max-w-xs truncate"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name} (SKU: {it.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* The Physical Scale Label Canvas */}
            <div className="w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col items-center justify-center min-h-[380px] shadow-inner relative overflow-hidden">
              <div className="absolute top-3 left-4 text-[11px] text-slate-400 font-mono">
                Physical Preview: {currentTemplate.widthMm}mm × {currentTemplate.heightMm}mm (Aspect Scale 8px/mm)
              </div>

              {/* Physical Label Simulation Card */}
              <div
                className="bg-white rounded-md shadow-2xl relative border border-slate-300 transition-all select-none overflow-hidden"
                style={{
                  width: `${currentTemplate.widthMm * 8}px`,
                  height: `${currentTemplate.heightMm * 8}px`,
                  maxWidth: '100%'
                }}
              >
                {/* Visual Thermal Grid guidelines */}
                <div className="absolute inset-0 pointer-events-none opacity-5 border border-dashed border-slate-900"></div>

                {/* Rendered Elements */}
                {currentTemplate.elements.map((el) => {
                  const isSelected = selectedElementId === el.id;

                  if (el.type === 'barcode') {
                    return (
                      <div
                        key={el.id}
                        onClick={() => setSelectedElementId(el.id)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-indigo-500 rounded bg-indigo-50/20' : ''
                        }`}
                        style={{
                          left: `${el.x}%`,
                          top: `${el.y}%`
                        }}
                      >
                        <svg ref={barcodeRef} className="max-w-full block"></svg>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all px-1 rounded whitespace-nowrap ${
                        isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50/60 font-bold' : ''
                      }`}
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        fontSize: `${el.fontSize}px`,
                        fontWeight: el.fontWeight,
                        textAlign: el.textAlign,
                        color: '#0f172a'
                      }}
                    >
                      {getElementDisplayValue(el)}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-slate-400 text-center">
                Click any element on the label to adjust position (X/Y sliders), font weight, or text prefix in the inspector.
              </div>
            </div>

            {/* Quick Test Print Button */}
            <div className="flex space-x-3 w-full">
              <button
                onClick={triggerNativePrint}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Test Print Current Label (Zebra / TSC)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Element Property Inspector (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Element Inspector
                </label>
                {selectedElement && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {selectedElement.type}
                  </span>
                )}
              </div>

              {selectedElement ? (
                <div className="space-y-3.5 text-xs">
                  {/* Position X Slider */}
                  <div>
                    <div className="flex justify-between text-slate-600 font-medium mb-1">
                      <span>Horizontal (X Axis):</span>
                      <span className="font-mono">{selectedElement.x}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={selectedElement.x}
                      onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Position Y Slider */}
                  <div>
                    <div className="flex justify-between text-slate-600 font-medium mb-1">
                      <span>Vertical (Y Axis):</span>
                      <span className="font-mono">{selectedElement.y}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={selectedElement.y}
                      onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Font Size */}
                  {selectedElement.type !== 'barcode' && (
                    <div>
                      <div className="flex justify-between text-slate-600 font-medium mb-1">
                        <span>Font Size:</span>
                        <span className="font-mono">{selectedElement.fontSize} px</span>
                      </div>
                      <input
                        type="range"
                        min={7}
                        max={24}
                        value={selectedElement.fontSize}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  )}

                  {/* Font Weight */}
                  {selectedElement.type !== 'barcode' && (
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Weight:</label>
                      <select
                        value={selectedElement.fontWeight}
                        onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-800"
                      >
                        <option value="normal">Normal (400)</option>
                        <option value="600">Medium (600)</option>
                        <option value="bold">Bold (700)</option>
                        <option value="800">Extra Bold (800)</option>
                      </select>
                    </div>
                  )}

                  {/* Custom Text Content */}
                  {selectedElement.type === 'customText' && (
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Text Content:</label>
                      <input
                        type="text"
                        value={selectedElement.customText || ''}
                        onChange={(e) => updateElement(selectedElement.id, { customText: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-800"
                      />
                    </div>
                  )}

                  {/* Prefix & Suffix for Price */}
                  {selectedElement.type === 'price' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-slate-600 font-medium block mb-1">Currency Prefix:</label>
                        <input
                          type="text"
                          value={selectedElement.prefix || ''}
                          onChange={(e) => updateElement(selectedElement.id, { prefix: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-800"
                          placeholder="e.g. ₹ "
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 font-medium block mb-1">Suffix / Tax Label:</label>
                        <input
                          type="text"
                          value={selectedElement.suffix || ''}
                          onChange={(e) => updateElement(selectedElement.id, { suffix: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-slate-800"
                          placeholder="e.g.  (Incl. GST)"
                        />
                      </div>
                    </div>
                  )}

                  {/* Delete Element Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleRemoveElement(selectedElement.id)}
                      className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-semibold transition-colors"
                    >
                      Remove from Canvas
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Select an element on the canvas to configure its position and typography.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Batch Label Print Queue Mode */
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Batch Barcode Label Printing Queue</h2>
              <p className="text-xs text-slate-500">
                Print adhesive price tags for received inventory batches directly to your thermal roll printer.
              </p>
            </div>
            <button
              onClick={triggerNativePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Print All Selected Labels ({Object.values(printQuantities).reduce((a: number, b: number) => a + b, 0)} total)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item Name & SKU</th>
                  <th className="py-3 px-4">Barcode</th>
                  <th className="py-3 px-4">Selling Price & MRP</th>
                  <th className="py-3 px-4">Assigned Template</th>
                  <th className="py-3 px-4 w-32">Copies to Print</th>
                  <th className="py-3 px-4 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((item) => {
                  const qty = printQuantities[item.id] || 0;
                  const itemTpl = templates.find(t => t.id === item.assignedLabelTemplateId) || currentTemplate;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.sku}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium">{item.barcode}</td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">₹{item.sellingPrice}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">(MRP: ₹{item.mrp})</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded text-[11px]">
                          {itemTpl.name}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min={0}
                          max={500}
                          value={qty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setPrintQuantities(prev => ({ ...prev, [item.id]: val }));
                          }}
                          className="w-20 bg-slate-50 border border-slate-200 rounded-md p-1.5 text-xs text-center font-bold text-slate-900"
                        />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setPreviewItemId(item.id);
                            setActiveSubTab('editor');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs"
                        >
                          View in Canvas →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Template */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Delete Label Template?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this template? Items currently assigned to this template will fall back to their category default.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteTemplate(confirmDeleteId);
                  setConfirmDeleteId(null);
                  if (selectedTemplateId === confirmDeleteId) {
                    setSelectedTemplateId(templates.find(t => t.id !== confirmDeleteId)?.id || '');
                  }
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
