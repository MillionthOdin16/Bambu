import { useState, useCallback } from 'react';
import { defaultSettings } from '../utils/slicer';
import './SettingsPanel.css';

const PRINTER_PROFILES = [
  { id: 'bambu_a1_mini', name: 'Bambu Lab A1 mini', bedX: 180, bedY: 180, bedZ: 180 },
  { id: 'bambu_a1', name: 'Bambu Lab A1', bedX: 256, bedY: 256, bedZ: 256 },
  { id: 'bambu_p1s', name: 'Bambu Lab P1S', bedX: 256, bedY: 256, bedZ: 256 },
  { id: 'bambu_p1p', name: 'Bambu Lab P1P', bedX: 256, bedY: 256, bedZ: 256 },
  { id: 'bambu_x1c', name: 'Bambu Lab X1 Carbon', bedX: 256, bedY: 256, bedZ: 256 },
  { id: 'bambu_x1', name: 'Bambu Lab X1', bedX: 256, bedY: 256, bedZ: 256 },
];

const INFILL_PATTERNS = [
  { id: 'grid', name: 'Grid' },
  { id: 'lines', name: 'Lines' },
  { id: 'triangles', name: 'Triangles' },
  { id: 'cubic', name: 'Cubic' },
  { id: 'gyroid', name: 'Gyroid' },
  { id: 'honeycomb', name: 'Honeycomb' },
];

const ADHESION_TYPES = [
  { id: 'none', name: 'None' },
  { id: 'skirt', name: 'Skirt' },
  { id: 'brim', name: 'Brim' },
  { id: 'raft', name: 'Raft' },
];

export default function SettingsPanel({ settings, onSettingsChange, isSlicing, onSlice }) {
  const [activeSection, setActiveSection] = useState('quality');
  
  const updateSetting = useCallback((key, value) => {
    onSettingsChange(prev => ({ ...prev, [key]: value }));
  }, [onSettingsChange]);
  
  const handlePrinterChange = useCallback((profileId) => {
    const profile = PRINTER_PROFILES.find(p => p.id === profileId);
    if (profile) {
      onSettingsChange(prev => ({
        ...prev,
        printerProfile: profileId,
        bedSizeX: profile.bedX,
        bedSizeY: profile.bedY,
        bedSizeZ: profile.bedZ
      }));
    }
  }, [onSettingsChange]);
  
  const sections = [
    { id: 'quality', label: 'Quality', icon: '◎' },
    { id: 'infill', label: 'Infill', icon: '▦' },
    { id: 'support', label: 'Support', icon: '▲' },
    { id: 'speed', label: 'Speed', icon: '◷' },
    { id: 'temp', label: 'Temp', icon: '♨' },
  ];
  
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Print Settings</h2>
        
        <div className="printer-select">
          <label>Printer</label>
          <select 
            value={settings.printerProfile || 'bambu_x1c'}
            onChange={(e) => handlePrinterChange(e.target.value)}
          >
            {PRINTER_PROFILES.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="settings-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            className={`tab-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="tab-icon">{section.icon}</span>
            <span className="tab-label">{section.label}</span>
          </button>
        ))}
      </div>
      
      <div className="settings-content">
        {activeSection === 'quality' && (
          <div className="settings-section animate-fade-in">
            <SettingSlider
              label="Layer Height"
              value={settings.layerHeight || defaultSettings.layerHeight}
              min={0.08}
              max={0.32}
              step={0.04}
              unit="mm"
              onChange={(v) => updateSetting('layerHeight', v)}
            />
            
            <SettingSlider
              label="Initial Layer Height"
              value={settings.initialLayerHeight || defaultSettings.initialLayerHeight}
              min={0.12}
              max={0.4}
              step={0.04}
              unit="mm"
              onChange={(v) => updateSetting('initialLayerHeight', v)}
            />
            
            <SettingSlider
              label="Line Width"
              value={settings.lineWidth || defaultSettings.lineWidth}
              min={0.3}
              max={0.6}
              step={0.05}
              unit="mm"
              onChange={(v) => updateSetting('lineWidth', v)}
            />
            
            <SettingSlider
              label="Wall Count"
              value={settings.wallCount || defaultSettings.wallCount}
              min={1}
              max={6}
              step={1}
              onChange={(v) => updateSetting('wallCount', v)}
            />
            
            <SettingSlider
              label="Top Layers"
              value={settings.topLayers || defaultSettings.topLayers}
              min={1}
              max={10}
              step={1}
              onChange={(v) => updateSetting('topLayers', v)}
            />
            
            <SettingSlider
              label="Bottom Layers"
              value={settings.bottomLayers || defaultSettings.bottomLayers}
              min={1}
              max={10}
              step={1}
              onChange={(v) => updateSetting('bottomLayers', v)}
            />
          </div>
        )}
        
        {activeSection === 'infill' && (
          <div className="settings-section animate-fade-in">
            <SettingSlider
              label="Infill Density"
              value={settings.infillDensity || defaultSettings.infillDensity}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => updateSetting('infillDensity', v)}
            />
            
            <div className="setting-item">
              <label>Infill Pattern</label>
              <select
                value={settings.infillPattern || defaultSettings.infillPattern}
                onChange={(e) => updateSetting('infillPattern', e.target.value)}
              >
                {INFILL_PATTERNS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-item">
              <label>Adhesion Type</label>
              <select
                value={settings.adhesionType || defaultSettings.adhesionType}
                onChange={(e) => updateSetting('adhesionType', e.target.value)}
              >
                {ADHESION_TYPES.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {activeSection === 'support' && (
          <div className="settings-section animate-fade-in">
            <SettingToggle
              label="Enable Support"
              value={settings.supportEnabled}
              onChange={(v) => updateSetting('supportEnabled', v)}
            />
            
            {settings.supportEnabled && (
              <>
                <SettingSlider
                  label="Support Density"
                  value={settings.supportDensity || defaultSettings.supportDensity}
                  min={5}
                  max={30}
                  step={5}
                  unit="%"
                  onChange={(v) => updateSetting('supportDensity', v)}
                />
                
                <SettingSlider
                  label="Support Angle"
                  value={settings.supportAngle || defaultSettings.supportAngle}
                  min={30}
                  max={70}
                  step={5}
                  unit="°"
                  onChange={(v) => updateSetting('supportAngle', v)}
                />
              </>
            )}
          </div>
        )}
        
        {activeSection === 'speed' && (
          <div className="settings-section animate-fade-in">
            <SettingSlider
              label="Print Speed"
              value={settings.printSpeed || defaultSettings.printSpeed}
              min={20}
              max={150}
              step={5}
              unit="mm/s"
              onChange={(v) => updateSetting('printSpeed', v)}
            />
            
            <SettingSlider
              label="Wall Speed"
              value={settings.wallSpeed || defaultSettings.wallSpeed}
              min={10}
              max={80}
              step={5}
              unit="mm/s"
              onChange={(v) => updateSetting('wallSpeed', v)}
            />
            
            <SettingSlider
              label="Infill Speed"
              value={settings.infillSpeed || defaultSettings.infillSpeed}
              min={30}
              max={150}
              step={10}
              unit="mm/s"
              onChange={(v) => updateSetting('infillSpeed', v)}
            />
            
            <SettingSlider
              label="Travel Speed"
              value={settings.travelSpeed || defaultSettings.travelSpeed}
              min={80}
              max={300}
              step={10}
              unit="mm/s"
              onChange={(v) => updateSetting('travelSpeed', v)}
            />
            
            <SettingSlider
              label="Initial Layer Speed"
              value={settings.initialLayerSpeed || defaultSettings.initialLayerSpeed}
              min={10}
              max={50}
              step={5}
              unit="mm/s"
              onChange={(v) => updateSetting('initialLayerSpeed', v)}
            />
          </div>
        )}
        
        {activeSection === 'temp' && (
          <div className="settings-section animate-fade-in">
            <SettingSlider
              label="Nozzle Temperature"
              value={settings.nozzleTemp || defaultSettings.nozzleTemp}
              min={180}
              max={300}
              step={5}
              unit="°C"
              onChange={(v) => updateSetting('nozzleTemp', v)}
            />
            
            <SettingSlider
              label="Bed Temperature"
              value={settings.bedTemp || defaultSettings.bedTemp}
              min={0}
              max={110}
              step={5}
              unit="°C"
              onChange={(v) => updateSetting('bedTemp', v)}
            />
            
            <SettingToggle
              label="Enable Retraction"
              value={settings.retractionEnabled !== false}
              onChange={(v) => updateSetting('retractionEnabled', v)}
            />
            
            {settings.retractionEnabled !== false && (
              <>
                <SettingSlider
                  label="Retraction Distance"
                  value={settings.retractionDistance || defaultSettings.retractionDistance}
                  min={0.2}
                  max={5}
                  step={0.1}
                  unit="mm"
                  onChange={(v) => updateSetting('retractionDistance', v)}
                />
                
                <SettingSlider
                  label="Retraction Speed"
                  value={settings.retractionSpeed || defaultSettings.retractionSpeed}
                  min={10}
                  max={80}
                  step={5}
                  unit="mm/s"
                  onChange={(v) => updateSetting('retractionSpeed', v)}
                />
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="settings-footer">
        <button 
          className="slice-button"
          onClick={onSlice}
          disabled={isSlicing}
        >
          {isSlicing ? (
            <>
              <span className="spinner"></span>
              Slicing...
            </>
          ) : (
            <>
              <span className="slice-icon">⚙</span>
              Slice Model
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SettingSlider({ label, value, min, max, step, unit = '', onChange }) {
  return (
    <div className="setting-item">
      <div className="setting-header">
        <label>{label}</label>
        <span className="setting-value">
          {typeof value === 'number' ? (step < 1 ? value.toFixed(2) : value) : value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

function SettingToggle({ label, value, onChange }) {
  return (
    <div className="setting-item toggle">
      <label>{label}</label>
      <button 
        className={`toggle-button ${value ? 'active' : ''}`}
        onClick={() => onChange(!value)}
      >
        <span className="toggle-handle"></span>
      </button>
    </div>
  );
}
