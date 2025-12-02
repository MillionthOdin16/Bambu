import React, { useState, useEffect } from 'react';
import { printPresets, getPrinterConfig, getFilamentProfile, getAllPrinters } from '../utils/printerConfigs';

function SlicerSettings({ settings, onSettingsChange, modelSize }) {
  const [expandedSections, setExpandedSections] = useState({
    presets: true,
    printer: true,
    quality: false,
    strength: false,
    speed: false,
    temperature: false,
    support: false,
    advanced: false
  });

  const [printerConfig, setPrinterConfig] = useState(null);
  const [showTips, setShowTips] = useState(true);

  useEffect(() => {
    const config = getPrinterConfig(settings.printer);
    setPrinterConfig(config);
  }, [settings.printer]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (field, value) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  const handlePrinterChange = (printerId) => {
    const config = getPrinterConfig(printerId);
    // Apply default settings for this printer
    onSettingsChange({
      ...settings,
      printer: printerId,
      ...config.defaultSettings
    });
  };

  const handleFilamentChange = (filamentType) => {
    const profile = getFilamentProfile(settings.printer, filamentType);
    if (profile) {
      onSettingsChange({
        ...settings,
        filamentType,
        nozzleTemp: profile.nozzle,
        bedTemp: profile.bed
      });
    } else {
      handleChange('filamentType', filamentType);
    }
  };

  const applyPreset = (presetKey) => {
    const preset = printPresets[presetKey];
    if (preset) {
      onSettingsChange({
        ...settings,
        ...preset.settings
      });
    }
  };

  const printers = getAllPrinters();
  const filamentTypes = printerConfig
    ? Object.keys(printerConfig.filamentProfiles)
    : ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'PA', 'PC'];
  const infillPatterns = ['grid', 'lines', 'triangles', 'cubic', 'gyroid', 'honeycomb'];

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <SettingsSection
        title="Quick Presets"
        icon="⚡"
        isExpanded={expandedSections.presets}
        onToggle={() => toggleSection('presets')}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(printPresets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="flex flex-col items-center justify-center p-3 border-2 border-gray-200 rounded-lg hover:border-bambu-primary hover:bg-green-50 transition-all"
            >
              <span className="text-2xl mb-1">{preset.icon}</span>
              <span className="text-xs font-semibold text-gray-900">{preset.name}</span>
              <span className="text-xs text-gray-500 text-center mt-1 hidden sm:block">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Start with a preset, then fine-tune settings below
          </p>
        </div>
      </SettingsSection>

      {/* Printer Selection */}
      <SettingsSection
        title="Printer"
        icon="🖨️"
        isExpanded={expandedSections.printer}
        onToggle={() => toggleSection('printer')}
      >
        <div className="space-y-3">
          <SelectField
            label="Printer Model"
            value={settings.printer}
            onChange={(e) => handlePrinterChange(e.target.value)}
            options={printers.map(p => ({
              value: p.id,
              label: `${p.displayName} (${p.buildVolume})`
            }))}
          />

          {printerConfig && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Build Volume:</span>
                  <div className="font-semibold">
                    {printerConfig.buildVolume.x}×{printerConfig.buildVolume.y}×{printerConfig.buildVolume.z}mm
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Max Speed:</span>
                  <div className="font-semibold">{printerConfig.maxSpeed}mm/s</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {printerConfig.features.multiColor && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Multi-Color</span>
                )}
                {printerConfig.features.enclosure && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Enclosed</span>
                )}
                {printerConfig.features.camera && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Camera</span>
                )}
                {printerConfig.features.lidar && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">LiDAR</span>
                )}
              </div>
            </div>
          )}

          {/* A1 Mini Specific Tips */}
          {settings.printer === 'bambu_a1_mini' && showTips && printerConfig?.tips && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-yellow-900">📌 A1 Mini Tips</h4>
                <button
                  onClick={() => setShowTips(false)}
                  className="text-yellow-600 hover:text-yellow-800 text-xs"
                >
                  ✕
                </button>
              </div>
              <ul className="text-xs text-yellow-800 space-y-1">
                {printerConfig.tips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Model Size Warning */}
          {modelSize && printerConfig && (
            <ModelSizeCheck modelSize={modelSize} printerConfig={printerConfig} />
          )}
        </div>
      </SettingsSection>

      {/* Quality Settings */}
      <SettingsSection
        title="Quality"
        icon="⚡"
        isExpanded={expandedSections.quality}
        onToggle={() => toggleSection('quality')}
      >
        <SliderField
          label="Layer Height"
          value={settings.layerHeight}
          onChange={(value) => handleChange('layerHeight', value)}
          min={0.08}
          max={0.32}
          step={0.04}
          unit="mm"
          description="Lower = better quality, slower print"
        />
        <div className="flex gap-2 mt-2">
          {[0.08, 0.12, 0.16, 0.2, 0.28].map(height => (
            <button
              key={height}
              onClick={() => handleChange('layerHeight', height)}
              className={`flex-1 text-xs py-2 px-1 rounded border-2 transition-all ${
                settings.layerHeight === height
                  ? 'border-bambu-primary bg-green-50 font-semibold'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {height}mm
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Strength Settings */}
      <SettingsSection
        title="Strength"
        icon="💪"
        isExpanded={expandedSections.strength}
        onToggle={() => toggleSection('strength')}
      >
        <SliderField
          label="Infill Density"
          value={settings.infillDensity}
          onChange={(value) => handleChange('infillDensity', value)}
          min={0}
          max={100}
          step={5}
          unit="%"
          description="Higher = stronger but heavier"
        />
        <SelectField
          label="Infill Pattern"
          value={settings.infillPattern}
          onChange={(e) => handleChange('infillPattern', e.target.value)}
          options={infillPatterns.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
        />
        <SliderField
          label="Wall Count"
          value={settings.wallCount}
          onChange={(value) => handleChange('wallCount', value)}
          min={1}
          max={8}
          step={1}
          unit=""
          description="Number of perimeter walls"
        />
        <div className="grid grid-cols-2 gap-4">
          <SliderField
            label="Top Layers"
            value={settings.topLayers}
            onChange={(value) => handleChange('topLayers', value)}
            min={0}
            max={10}
            step={1}
            unit=""
          />
          <SliderField
            label="Bottom Layers"
            value={settings.bottomLayers}
            onChange={(value) => handleChange('bottomLayers', value)}
            min={0}
            max={10}
            step={1}
            unit=""
          />
        </div>
      </SettingsSection>

      {/* Speed Settings */}
      <SettingsSection
        title="Speed"
        icon="🚀"
        isExpanded={expandedSections.speed}
        onToggle={() => toggleSection('speed')}
      >
        {printerConfig && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
            Recommended max speed for {printerConfig.displayName}: {printerConfig.recommendedSpeed}mm/s
          </div>
        )}
        <SliderField
          label="Outer Wall Speed"
          value={settings.outerWallSpeed}
          onChange={(value) => handleChange('outerWallSpeed', value)}
          min={20}
          max={printerConfig?.maxSpeed || 300}
          step={10}
          unit="mm/s"
        />
        <SliderField
          label="Inner Wall Speed"
          value={settings.innerWallSpeed}
          onChange={(value) => handleChange('innerWallSpeed', value)}
          min={50}
          max={printerConfig?.maxSpeed || 300}
          step={10}
          unit="mm/s"
        />
        <SliderField
          label="Infill Speed"
          value={settings.infillSpeed}
          onChange={(value) => handleChange('infillSpeed', value)}
          min={50}
          max={printerConfig?.maxSpeed || 300}
          step={10}
          unit="mm/s"
        />
        <SliderField
          label="Top Surface Speed"
          value={settings.topSpeed}
          onChange={(value) => handleChange('topSpeed', value)}
          min={30}
          max={200}
          step={10}
          unit="mm/s"
        />
      </SettingsSection>

      {/* Temperature Settings */}
      <SettingsSection
        title="Temperature"
        icon="🌡️"
        isExpanded={expandedSections.temperature}
        onToggle={() => toggleSection('temperature')}
      >
        <SelectField
          label="Filament Type"
          value={settings.filamentType}
          onChange={(e) => handleFilamentChange(e.target.value)}
          options={filamentTypes.map(f => ({ value: f, label: f }))}
        />
        {printerConfig && getFilamentProfile(settings.printer, settings.filamentType)?.requiresEnclosure && !printerConfig.features.enclosure && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
            ⚠️ <strong>Warning:</strong> {settings.filamentType} typically requires an enclosure.
            Your {printerConfig.displayName} doesn't have one built-in. Consider adding aftermarket enclosure.
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <SliderField
            label="Nozzle Temp"
            value={settings.nozzleTemp}
            onChange={(value) => handleChange('nozzleTemp', value)}
            min={180}
            max={300}
            step={5}
            unit="°C"
          />
          <SliderField
            label="Bed Temp"
            value={settings.bedTemp}
            onChange={(value) => handleChange('bedTemp', value)}
            min={0}
            max={120}
            step={5}
            unit="°C"
          />
        </div>
      </SettingsSection>

      {/* Support Settings */}
      <SettingsSection
        title="Support"
        icon="🏗️"
        isExpanded={expandedSections.support}
        onToggle={() => toggleSection('support')}
      >
        <ToggleField
          label="Enable Support"
          value={settings.enableSupport}
          onChange={(value) => handleChange('enableSupport', value)}
          description="Add support structures for overhangs"
        />
      </SettingsSection>

      {/* Advanced Settings */}
      <SettingsSection
        title="Advanced"
        icon="⚙️"
        isExpanded={expandedSections.advanced}
        onToggle={() => toggleSection('advanced')}
      >
        <SliderField
          label="Flow Rate"
          value={settings.flowRate}
          onChange={(value) => handleChange('flowRate', value)}
          min={0.8}
          max={1.2}
          step={0.05}
          unit=""
          description="Extrusion multiplier"
        />
        <div className="grid grid-cols-2 gap-4">
          <SliderField
            label="Skirt Lines"
            value={settings.skirt}
            onChange={(value) => handleChange('skirt', value)}
            min={0}
            max={5}
            step={1}
            unit=""
          />
          <SliderField
            label="Brim Width"
            value={settings.brimWidth}
            onChange={(value) => handleChange('brimWidth', value)}
            min={0}
            max={20}
            step={1}
            unit="mm"
          />
        </div>
        <SliderField
          label="Nozzle Diameter"
          value={settings.nozzleDiameter}
          onChange={(value) => handleChange('nozzleDiameter', value)}
          min={0.2}
          max={0.8}
          step={0.2}
          unit="mm"
          description="Match your installed nozzle size"
        />
      </SettingsSection>
    </div>
  );
}

// Model Size Check Component
function ModelSizeCheck({ modelSize, printerConfig }) {
  const { buildVolume } = printerConfig;
  const oversized = {
    x: modelSize.x > buildVolume.x,
    y: modelSize.y > buildVolume.y,
    z: modelSize.z > buildVolume.z
  };

  const isOversized = oversized.x || oversized.y || oversized.z;

  if (!isOversized) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
        ✅ Model fits build volume ({modelSize.x.toFixed(1)}×{modelSize.y.toFixed(1)}×{modelSize.z.toFixed(1)}mm)
      </div>
    );
  }

  const scale = Math.min(
    buildVolume.x / modelSize.x,
    buildVolume.y / modelSize.y,
    buildVolume.z / modelSize.z
  );

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-sm font-semibold text-red-900 mb-1">
        ⚠️ Model Too Large!
      </div>
      <div className="text-xs text-red-800 space-y-1">
        <div>Model: {modelSize.x.toFixed(1)}×{modelSize.y.toFixed(1)}×{modelSize.z.toFixed(1)}mm</div>
        <div>Build: {buildVolume.x}×{buildVolume.y}×{buildVolume.z}mm</div>
        <div className="font-semibold mt-2">
          Recommended scale: {Math.floor(scale * 100)}%
        </div>
        {oversized.x && <div>• X-axis exceeds by {(modelSize.x - buildVolume.x).toFixed(1)}mm</div>}
        {oversized.y && <div>• Y-axis exceeds by {(modelSize.y - buildVolume.y).toFixed(1)}mm</div>}
        {oversized.z && <div>• Z-axis exceeds by {(modelSize.z - buildVolume.z).toFixed(1)}mm</div>}
      </div>
    </div>
  );
}

// Collapsible Section Component
function SettingsSection({ title, icon, isExpanded, onToggle, children }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

// Slider Field Component
function SliderField({ label, value, onChange, min, max, step, unit, description }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-bambu-primary">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-bambu-primary"
      />
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}

// Select Field Component
function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bambu-primary focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Toggle Field Component
function ToggleField({ label, value, onChange, description }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-bambu-primary' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default SlicerSettings;
