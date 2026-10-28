import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CircleDollarSign,
  Droplets,
  Fuel,
  Plus,
  Receipt,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { EXPENSE_CATEGORIES, FUEL_TYPES } from '../lib/constants';
import { capitalise, formatCurrency, formatDate, formatNumber, todayInput } from '../lib/format';
import type { Expense, ExpensesResponse, FuelLog, FuelLogsResponse } from '../types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Select,
  StatCard,
  Tabs,
  Textarea,
  Toggle,
} from '../components/ui';

const COLORS = ['#FFD400', '#60A5FA', '#34D399', '#A78BFA', '#F87171', '#FBBF24', '#22D3EE', '#A0A5AF'];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#14161B',
    border: '1px solid #292D35',
    borderRadius: 12,
    color: '#F5F5F5',
    fontSize: 12,
  },
  labelStyle: { color: '#A0A5AF' },
};

interface FuelForm {
  vehicleId: string;
  logDate: string;
  fuelType: string;
  quantity: string;
  totalCost: string;
  pricePerUnit: string;
  odometer: string;
  isFullTank: boolean;
  notes: string;
}

interface ExpenseForm {
  vehicleId: string;
  expenseDate: string;
  category: string;
  amount: string;
  description: string;
  receiptUrl: string;
}

export default function ExpensesPage() {
  const { vehicles, activeVehicleId, activeVehicle, refreshVehicles } = useVehicles();
  const { user } = useAuth();
  const { success } = useToast();
  const [vehicleId, setVehicleId] = useState(activeVehicleId || '');
  const [tab, setTab] = useState('fuel');
  const [fuel, setFuel] = useState<FuelLogsResponse | null>(null);
  const [expenses, setExpenses] = useState<ExpensesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fuelOpen, setFuelOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState<FuelForm>({} as FuelForm);
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({} as ExpenseForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingFuel, setDeletingFuel] = useState<FuelLog | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!vehicleId && activeVehicleId) setVehicleId(activeVehicleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVehicleId]);

  const load = async () => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [fuelData, expenseData] = await Promise.all([
        api.get<FuelLogsResponse>('/fuel-expenses/fuel', { vehicleId }),
        api.get<ExpensesResponse>('/fuel-expenses/expenses', { vehicleId }),
      ]);
      setFuel(fuelData);
      setExpenses(expenseData);
    } catch (err: any) {
      setError(err.message || 'Could not load expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const openFuel = () => {
    const vehicle = vehicles.find((item) => item.id === vehicleId) || activeVehicle;
    setFuelForm({
      vehicleId: vehicle?.id || '',
      logDate: todayInput(),
      fuelType: vehicle?.fuelType || 'Petrol',
      quantity: '',
      totalCost: '',
      pricePerUnit: '',
      odometer: String(vehicle?.currentOdometer || ''),
      isFullTank: true,
      notes: '',
    });
    setFormError('');
    setFuelOpen(true);
  };

  const openExpense = () => {
    const vehicle = vehicles.find((item) => item.id === vehicleId) || activeVehicle;
    setExpenseForm({
      vehicleId: vehicle?.id || '',
      expenseDate: todayInput(),
      category: 'Other',
      amount: '',
      description: '',
      receiptUrl: '',
    });
    setFormError('');
    setExpenseOpen(true);
  };

  const updateFuel = (key: keyof FuelForm, value: string | boolean) =>
    setFuelForm((current) => ({ ...current, [key]: value }));

  const updateExpense = (key: keyof ExpenseForm, value: string) =>
    setExpenseForm((current) => ({ ...current, [key]: value }));

  const submitFuel = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!fuelForm.vehicleId || !fuelForm.quantity || !fuelForm.totalCost || !fuelForm.odometer) {
      setFormError('Quantity, total cost and odometer are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/fuel-expenses/fuel', {
        ...fuelForm,
        quantity: Number(fuelForm.quantity),
        totalCost: Number(fuelForm.totalCost),
        pricePerUnit: fuelForm.pricePerUnit ? Number(fuelForm.pricePerUnit) : undefined,
        odometer: Number(fuelForm.odometer),
      });
      success('Fuel fill-up recorded.');
      setFuelOpen(false);
      await refreshVehicles();
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not save fuel log.');
    } finally {
      setSaving(false);
    }
  };

  const submitExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!expenseForm.vehicleId || !expenseForm.amount || !expenseForm.description.trim()) {
      setFormError('Amount and description are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/fuel-expenses/expenses', {
        ...expenseForm,
        amount: Number(expenseForm.amount),
      });
      success('Expense recorded.');
      setExpenseOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not save expense.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingFuel && !deletingExpense) return;
    setDeleteLoading(true);
    try {
      if (deletingFuel) {
        await api.delete(`/fuel-expenses/fuel/${deletingFuel.id}`);
        success('Fuel log and linked expense deleted.');
      } else if (deletingExpense) {
        await api.delete(`/fuel-expenses/expenses/${deletingExpense.id}`);
        success('Expense deleted.');
      }
      setDeletingFuel(null);
      setDeletingExpense(null);
      await refreshVehicles();
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not delete entry.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const selectedVehicle = vehicles.find((item) => item.id === vehicleId);
  const pieData = useMemo(
    () => (expenses?.summary.categoryBreakdown || []).filter((item) => item.value > 0),
    [expenses]
  );

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="Fuel & Expenses"
        subtitle="Every fill-up and cost, automatically consolidated per vehicle."
        actions={
          <>
            <Button variant="secondary" icon={<Receipt className="h-4 w-4" />} onClick={openExpense} disabled={!vehicles.length}>
              Add expense
            </Button>
            <Button icon={<Fuel className="h-4 w-4" />} onClick={openFuel} disabled={!vehicles.length}>
              Log fuel
            </Button>
          </>
        }
      />

      {!vehicles.length ? (
        <EmptyState
          icon={<Fuel className="h-7 w-7" />}
          title="No vehicles yet"
          description="Add a vehicle to start recording fuel and expenses."
          action={<Link to="/garage"><Button>Add vehicle</Button></Link>}
        />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} className="sm:w-64">
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname} · {vehicle.registrationNumber}</option>
              ))}
            </Select>
            <p className="text-xs text-text-secondary">{selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : ''}</p>
          </div>

          {error && <div className="mb-4"><ErrorState message={error} onRetry={load} /></div>}

          {loading ? (
            <LoadingBlock label="Loading fuel and expense data…" />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="This month" value={formatCurrency(expenses?.summary.thisMonthTotal || 0, user?.settings?.currency)} hint="All categories" icon={<CircleDollarSign className="h-5 w-5" />} />
                <StatCard label="Year to date" value={formatCurrency(expenses?.summary.ytdTotal || 0, user?.settings?.currency)} hint="Current calendar year" />
                <StatCard label="Fuel spend" value={formatCurrency(fuel?.metrics.totalFuelSpend || 0, user?.settings?.currency)} hint={`${fuel?.logs.length || 0} fill-ups`} icon={<Fuel className="h-5 w-5" />} />
                <StatCard label="Average efficiency" value={fuel?.metrics.avgEfficiency ? `${fuel.metrics.avgEfficiency} km/L` : '—'} hint="Full-tank calculations only" icon={<TrendingUp className="h-5 w-5" />} />
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <Card>
                  <CardHeader title="Monthly spend" subtitle="Last 6 months by category" />
                  {expenses?.summary.monthlySpending?.length ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expenses.summary.monthlySpending}>
                          <CartesianGrid stroke="#292D35" strokeDasharray="4 4" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: '#A0A5AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#A0A5AF', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                          <Tooltip {...tooltipStyle} formatter={(value) => formatCurrency(Number(value), user?.settings?.currency)} />
                          <Bar dataKey="fuel" stackId="a" fill="#FFD400" />
                          <Bar dataKey="service" stackId="a" fill="#60A5FA" />
                          <Bar dataKey="insurance" stackId="a" fill="#34D399" />
                          <Bar dataKey="other" stackId="a" fill="#A0A5AF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="py-16 text-center text-sm text-text-secondary">No expense history yet.</p>
                  )}
                </Card>

                <Card>
                  <CardHeader title="Category split" subtitle="Where your money goes" />
                  {pieData.length ? (
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                      <div className="h-48 w-full sm:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3}>
                              {pieData.map((entry, index) => (
                                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip {...tooltipStyle} formatter={(value) => formatCurrency(Number(value), user?.settings?.currency)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full space-y-1.5 sm:w-1/2">
                        {pieData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
                            <span className="flex items-center gap-2 text-text-secondary">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              {capitalise(entry.name)}
                            </span>
                            <span className="font-medium text-text-main">{formatCurrency(entry.value, user?.settings?.currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="py-16 text-center text-sm text-text-secondary">Add expenses to see the breakdown.</p>
                  )}
                </Card>
              </div>

              <div className="mt-5">
                <Tabs
                  tabs={[
                    { key: 'fuel', label: 'Fuel logs', count: fuel?.logs.length || 0 },
                    { key: 'expenses', label: 'All expenses', count: expenses?.expenses.length || 0 },
                  ]}
                  active={tab}
                  onChange={setTab}
                />
              </div>

              <Card className="mt-4">
                {tab === 'fuel' ? (
                  fuel?.logs.length ? (
                    <div className="space-y-2">
                      {fuel.logs.map((log) => (
                        <div key={log.id} className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-yellow/10 text-primary-yellow">
                              <Droplets className="h-4 w-4" />
                            </span>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-text-main">{log.quantity} L · {capitalise(log.fuelType)}</p>
                                {log.isFullTank && <Badge tone="yellow">Full tank</Badge>}
                                {log.calculatedEfficiency ? <Badge tone="success">{log.calculatedEfficiency} km/L</Badge> : null}
                              </div>
                              <p className="text-[11px] text-text-secondary">
                                {formatDate(log.logDate)} · {formatNumber(log.odometer)} km · {formatCurrency(log.pricePerUnit, user?.settings?.currency)}/L
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2 sm:justify-end">
                            <p className="text-sm font-semibold text-text-main">{formatCurrency(log.totalCost, user?.settings?.currency)}</p>
                            <button onClick={() => setDeletingFuel(log)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-300" aria-label="Delete fuel log">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Fuel className="h-7 w-7" />}
                      title="No fuel logs"
                      description="Log full-tank fill-ups to calculate real-world efficiency."
                      action={<Button icon={<Plus className="h-4 w-4" />} onClick={openFuel}>Log fuel</Button>}
                    />
                  )
                ) : expenses?.expenses.length ? (
                  <div className="space-y-2">
                    {expenses.expenses.map((expense) => (
                      <div key={expense.id} className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-yellow/10 text-primary-yellow">
                            <Receipt className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-text-main">{expense.description}</p>
                              <Badge tone="neutral">{capitalise(expense.category)}</Badge>
                              {expense.sourceType !== 'MANUAL' && <Badge tone="info">{capitalise(expense.sourceType)}</Badge>}
                            </div>
                            <p className="text-[11px] text-text-secondary">{formatDate(expense.expenseDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                          <p className="text-sm font-semibold text-text-main">{formatCurrency(expense.amount, user?.settings?.currency)}</p>
                          {expense.sourceType === 'MANUAL' ? (
                            <button onClick={() => setDeletingExpense(expense)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-300" aria-label="Delete expense">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="w-7" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Receipt className="h-7 w-7" />}
                    title="No expenses"
                    description="Log fuel, services or manual costs to build your spending history."
                    action={<Button icon={<Plus className="h-4 w-4" />} onClick={openExpense}>Add expense</Button>}
                  />
                )}
              </Card>
            </>
          )}
        </>
      )}

      <Modal
        open={fuelOpen}
        onClose={() => setFuelOpen(false)}
        title="Log fuel fill-up"
        description="Full-tank logs enable accurate efficiency calculations."
        size="lg"
      >
        <form onSubmit={submitFuel} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vehicle" required>
              <Select value={fuelForm.vehicleId || ''} onChange={(event) => updateFuel('vehicleId', event.target.value)}>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname} · {vehicle.registrationNumber}</option>
                ))}
              </Select>
            </Field>
            <Field label="Date" required>
              <Input type="date" value={fuelForm.logDate || todayInput()} onChange={(event) => updateFuel('logDate', event.target.value)} />
            </Field>
            <Field label="Fuel type">
              <Select value={fuelForm.fuelType || 'Petrol'} onChange={(event) => updateFuel('fuelType', event.target.value)}>
                {FUEL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </Field>
            <Field label="Quantity (litres)" required>
              <Input type="number" min={0} step="0.01" value={fuelForm.quantity || ''} onChange={(event) => updateFuel('quantity', event.target.value)} />
            </Field>
            <Field label="Total cost" required>
              <Input type="number" min={0} step="0.01" value={fuelForm.totalCost || ''} onChange={(event) => updateFuel('totalCost', event.target.value)} />
            </Field>
            <Field label="Price per litre" hint="Calculated automatically when left blank">
              <Input type="number" min={0} step="0.01" value={fuelForm.pricePerUnit || ''} onChange={(event) => updateFuel('pricePerUnit', event.target.value)} />
            </Field>
            <Field label="Odometer (km)" required>
              <Input type="number" min={0} value={fuelForm.odometer || ''} onChange={(event) => updateFuel('odometer', event.target.value)} />
            </Field>
            <Field label="Notes">
              <Input value={fuelForm.notes || ''} onChange={(event) => updateFuel('notes', event.target.value)} placeholder="Station, payment method…" />
            </Field>
          </div>
          <Toggle
            checked={!!fuelForm.isFullTank}
            onChange={(value) => updateFuel('isFullTank', value)}
            label="Full tank"
            description="Required for the next efficiency calculation."
          />
          {formError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setFuelOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save fuel log</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        title="Add expense"
        description="Manual expenses appear in your monthly spending breakdown."
      >
        <form onSubmit={submitExpense} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vehicle" required>
              <Select value={expenseForm.vehicleId || ''} onChange={(event) => updateExpense('vehicleId', event.target.value)}>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname} · {vehicle.registrationNumber}</option>
                ))}
              </Select>
            </Field>
            <Field label="Date" required>
              <Input type="date" value={expenseForm.expenseDate || todayInput()} onChange={(event) => updateExpense('expenseDate', event.target.value)} />
            </Field>
            <Field label="Category">
              <Select value={expenseForm.category || 'Other'} onChange={(event) => updateExpense('category', event.target.value)}>
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </Field>
            <Field label="Amount" required>
              <Input type="number" min={0} step="0.01" value={expenseForm.amount || ''} onChange={(event) => updateExpense('amount', event.target.value)} />
            </Field>
            <Field label="Description" required className="sm:col-span-2">
              <Input value={expenseForm.description || ''} onChange={(event) => updateExpense('description', event.target.value)} placeholder="Car wash, parking, accessories…" />
            </Field>
            <Field label="Receipt URL" className="sm:col-span-2">
              <Input value={expenseForm.receiptUrl || ''} onChange={(event) => updateExpense('receiptUrl', event.target.value)} placeholder="https://…" />
            </Field>
          </div>
          {formError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setExpenseOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save expense</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deletingFuel || !!deletingExpense}
        onCancel={() => { setDeletingFuel(null); setDeletingExpense(null); }}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title={deletingFuel ? 'Delete fuel log?' : 'Delete expense?'}
        message={
          deletingFuel
            ? 'The fuel log and its linked expense will be removed.'
            : 'This manual expense will be permanently removed.'
        }
        confirmLabel="Delete entry"
      />
    </div>
  );
}
