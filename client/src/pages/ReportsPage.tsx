import { useState } from 'react';
import { CheckSquare, Download, FileText, Square } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { downloadVehicleReport } from '../lib/api';
import { REPORT_SECTIONS } from '../lib/constants';
import { formatNumber } from '../lib/format';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  PageHeader,
  Select,
} from '../components/ui';

export default function ReportsPage() {
  const { vehicles, activeVehicleId } = useVehicles();
  const { success } = useToast();
  const [vehicleId, setVehicleId] = useState(activeVehicleId || vehicles[0]?.id || '');
  const [sections, setSections] = useState<Record<string, boolean>>(
    Object.fromEntries(REPORT_SECTIONS.map((section) => [section.key, true]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (key: string) =>
    setSections((current) => ({ ...current, [key]: !current[key] }));

  const allSelected = REPORT_SECTIONS.every((section) => sections[section.key]);
  const toggleAll = () =>
    setSections(Object.fromEntries(REPORT_SECTIONS.map((section) => [section.key, !allSelected])));

  const generate = async () => {
    if (!vehicleId) return;
    if (!REPORT_SECTIONS.some((section) => sections[section.key])) {
      setError('Select at least one section to include in the report.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await downloadVehicleReport(vehicleId, sections);
      success('Report generated. Check your downloads.');
    } catch (err: any) {
      setError(err.message || 'Could not generate report.');
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Vehicle Reports"
        subtitle="Generate a polished PDF dossier of your vehicle history, ready to share or archive."
      />

      {!vehicles.length ? (
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title="No vehicles to report on"
          description="Add a vehicle and some records, then generate a complete history report."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader title="Report builder" subtitle="Choose the vehicle and sections to include" />
            <div className="space-y-4">
              <Field label="Vehicle" required>
                <Select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.nickname} · {vehicle.registrationNumber}
                    </option>
                  ))}
                </Select>
              </Field>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Sections</p>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="flex items-center gap-1 text-xs text-primary-yellow hover:text-primary-hover"
                  >
                    {allSelected ? <Square className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
                    {allSelected ? 'Clear all' : 'Select all'}
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {REPORT_SECTIONS.map((section) => (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => toggle(section.key)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                        sections[section.key]
                          ? 'border-primary-yellow/40 bg-primary-yellow/5 text-text-main'
                          : 'border-border-subtle bg-bg-elevated/40 text-text-secondary hover:text-text-main'
                      }`}
                    >
                      {section.label}
                      {sections[section.key] ? (
                        <CheckSquare className="h-4 w-4 text-primary-yellow" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

              <Button className="w-full" loading={loading} onClick={generate} icon={<Download className="h-4 w-4" />}>
                Generate PDF report
              </Button>
            </div>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader
                title="Preview"
                subtitle={selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'Select a vehicle'}
                action={<Badge tone="yellow">{REPORT_SECTIONS.filter((section) => sections[section.key]).length} sections</Badge>}
              />
              {selectedVehicle && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                    <span className="text-text-secondary">Registration</span>
                    <span className="font-medium text-text-main">{selectedVehicle.registrationNumber}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                    <span className="text-text-secondary">Odometer</span>
                    <span className="font-medium text-text-main">{formatNumber(selectedVehicle.currentOdometer)} km</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                    <span className="text-text-secondary">Vehicle type</span>
                    <span className="font-medium text-text-main">{selectedVehicle.vehicleType}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                    <span className="text-text-secondary">Fuel</span>
                    <span className="font-medium text-text-main">{selectedVehicle.fuelType}</span>
                  </div>
                  {selectedVehicle.latestService && (
                    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                      <span className="text-text-secondary">Latest service</span>
                      <span className="font-medium text-text-main">{selectedVehicle.latestService.serviceType}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card>
              <CardHeader title="What's included" subtitle="A single, shareable PDF" />
              <ul className="space-y-2 text-xs text-text-secondary">
                <li>• Vehicle profile and identifying details</li>
                <li>• Complete service and maintenance history</li>
                <li>• Odometer readings and mileage trend</li>
                <li>• Documents, insurance and warranty records</li>
                <li>• Fuel logs, efficiency and expense summary</li>
              </ul>
              <p className="mt-3 text-[11px] text-text-secondary/70">
                Reports are generated on the server and downloaded directly — nothing is stored permanently.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
