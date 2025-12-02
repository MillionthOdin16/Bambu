import React, { useState } from 'react';

function SlicerSettings({ settings, onSettingsChange }) {
  const [expandedSections, setExpandedSections] = useState({
    printer: true,
    quality: true,
    strength: false,
    speed: false,
    temperature: false,
    support: false,
    advanced: false
  });

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

  const printers = [
    { id: 'bambu_x1c', name: 'X1 Carbon' },
    { id: 'bambu_x1', name: 'X1' },
    { id: 'bambu_p1p', name: 'P1P' },
    { id: 'bambu_p1s', name: 'P1S' },
    { id: 'bambu_a1', name: 'A1' },
    { id: 'bambu_a1_mini', name: 'A1 Mini' }
  ];

  const filamentTypes = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon'];
  const infillPatterns = ['grid', 'lines', 'triangles', 'cubic', 'gyroid', 'honeycomb'];

  return (
    <div className="space-y-4">
      {/* Printer Selection */}
      <SettingsSection
        title="Printer"
        icon="🖨️"
        isExpanded={expandedSections.printer}
        onToggle={() => toggleSection('printer')}
      >
        <SelectField
          label="Printer Model"
          value={settings.printer}
          onChange={(e) => handleChange('printer', e.target.value)}
          options={printers.map(p => ({ value: p.id, label: p.name }))}
        />
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
          max={0.28}
          step={0.04}
          unit="mm"
          description="Lower = better quality, slower print"
        />
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
        <SliderField
          label="Outer Wall Speed"
          value={settings.outerWallSpeed}
          onChange={(value) => handleChange('outerWallSpeed', value)}
          min={20}
          max={200}
          step={10}
          unit="mm/s"
        />
        <SliderField
          label="Inner Wall Speed"
          value={settings.innerWallSpeed}
          onChange={(value) => handleChange('innerWallSpeed', value)}
          min={50}
          max={300}
          step={10}
          unit="mm/s"
        />
        <SliderField
          label="Infill Speed"
          value={settings.infillSpeed}
          onChange={(value) => handleChange('infillSpeed', value)}
          min={50}
          max={300}
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
          onChange={(e) => handleChange('filamentType', e.target.value)}
          options={filamentTypes.map(f => ({ value: f, label: f }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <SliderField
            label="Nozzle Temp"
            value={settings.nozzleTemp}
            onChange={(value) => handleChange('nozzleTemp', value)}
            min={180}
            max={280}
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
      </SettingsSection>
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
        className="input-field"
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
