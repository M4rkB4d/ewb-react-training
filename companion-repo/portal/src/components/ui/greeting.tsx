// src/components/ui/greeting.tsx
interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps) {
  return <p className="text-gray-700">Welcome, {name}.</p>;
}
