interface WeatherWidgetProps {
  title: string;
  value: string;
  accent?: "blue" | "green" | "purple" | "orange";
}

export const WeatherWidget = ({
  title,
  value,
  accent = "blue"
}: WeatherWidgetProps) => {
  return (
    <div className={`widget widget-${accent}`}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
};

