// src/pages/design-system.tsx
import {
  Button, Input, Card, CardHeader, CardTitle, CardBody, Badge, Alert,
} from '@/components/ui';

export function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 p-8">
      <h1 className="text-3xl font-bold">EWB Design System</h1>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="error">Error</Button>
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Inputs</h2>
        <div className="max-w-sm space-y-4">
          <Input label="Account Name" placeholder="Enter name" />
          <Input label="Amount" type="number" hint="Minimum ₱100" />
          <Input label="Email" error="Invalid email address" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Cards</h2>
        <Card>
          <CardHeader>
            <CardTitle>Personal Savings</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-gray-900">₱150,000.00</p>
          </CardBody>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Badges</h2>
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Failed</Badge>
          <Badge variant="info">Processing</Badge>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Alerts</h2>
        <div className="space-y-4">
          <Alert variant="info" title="Information">Your statement is ready for download.</Alert>
          <Alert variant="success" title="Success">Transfer completed successfully.</Alert>
          <Alert variant="warning" title="Warning">Low balance detected.</Alert>
          <Alert variant="error" title="Error">Transaction failed. Please try again.</Alert>
        </div>
      </section>
    </div>
  );
}
