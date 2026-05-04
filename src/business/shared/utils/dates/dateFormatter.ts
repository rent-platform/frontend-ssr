const shortDate = (date: Date) => {
  return new Intl.DateTimeFormat("ru-RU").format(date);
};

const longDate = (date: Date) => {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};
export { shortDate, longDate };

