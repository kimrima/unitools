// Calculator Tool Processing Functions - All client-side

export interface CalcToolResult {
  value: string;
  label: string;
  detail?: string;
  stats?: Record<string, string | number>;
}

// Percentage Calculator
export function percentageCalc(percent: number, of: number): CalcToolResult {
  const result = (percent / 100) * of;
  return {
    value: result.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    label: 'Result',
    detail: `${percent}% of ${of}`,
    stats: { 'Percentage': `${percent}%`, 'Base Value': of, 'Result': result }
  };
}

// Discount Calculator
export function discountCalc(originalPrice: number, discountPercent: number): CalcToolResult {
  const savings = (discountPercent / 100) * originalPrice;
  const finalPrice = originalPrice - savings;
  return {
    value: `$${finalPrice.toFixed(2)}`,
    label: 'Final Price',
    detail: `You save $${savings.toFixed(2)} (${discountPercent}%)`,
    stats: {
      'Original Price': `$${originalPrice.toFixed(2)}`,
      'Discount': `${discountPercent}%`,
      'You Save': `$${savings.toFixed(2)}`,
      'Final Price': `$${finalPrice.toFixed(2)}`
    }
  };
}

// Date Calculator
export function dateCalc(date1: string, date2?: string): CalcToolResult {
  const d1 = new Date(date1);
  const d2 = date2 ? new Date(date2) : new Date();
  
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  return {
    value: `${diffDays} days`,
    label: 'Days Between',
    detail: `${diffWeeks} weeks, ${diffMonths} months`,
    stats: {
      'Days': diffDays,
      'Weeks': diffWeeks,
      'Months': diffMonths,
      'Years': diffYears
    }
  };
}

// Age Calculator
export function ageCalc(birthDate: string): CalcToolResult {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  
  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

  return {
    value: `${years} years`,
    label: 'Your Age',
    detail: `${months} months, ${days} days`,
    stats: {
      'Years': years,
      'Months': months,
      'Days': days,
      'Total Days': totalDays.toLocaleString()
    }
  };
}

// BMI Calculator
export function bmiCalc(weightKg: number, heightCm: number): CalcToolResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal Weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  return {
    value: bmi.toFixed(1),
    label: 'Your BMI',
    detail: category,
    stats: {
      'BMI': bmi.toFixed(2),
      'Category': category,
      'Weight': `${weightKg} kg`,
      'Height': `${heightCm} cm`
    }
  };
}

// Unit Converter
export function unitConverter(value: number, from: string, to: string): CalcToolResult {
  const conversions: Record<string, Record<string, number | ((v: number) => number)>> = {
    // Length (base: meters)
    'm': { 'ft': 3.28084, 'cm': 100, 'in': 39.3701, 'km': 0.001, 'mi': 0.000621371 },
    'ft': { 'm': 0.3048, 'cm': 30.48, 'in': 12, 'km': 0.0003048, 'mi': 0.000189394 },
    'cm': { 'm': 0.01, 'ft': 0.0328084, 'in': 0.393701 },
    'in': { 'm': 0.0254, 'ft': 0.0833333, 'cm': 2.54 },
    'km': { 'm': 1000, 'mi': 0.621371 },
    'mi': { 'km': 1.60934, 'm': 1609.34 },
    // Weight (base: kg)
    'kg': { 'lb': 2.20462, 'g': 1000, 'oz': 35.274 },
    'lb': { 'kg': 0.453592, 'g': 453.592, 'oz': 16 },
    'g': { 'kg': 0.001, 'lb': 0.00220462, 'oz': 0.035274 },
    'oz': { 'kg': 0.0283495, 'lb': 0.0625, 'g': 28.3495 },
    // Temperature
    'c': { 'f': (v: number) => (v * 9/5) + 32, 'k': (v: number) => v + 273.15 },
    'f': { 'c': (v: number) => (v - 32) * 5/9, 'k': (v: number) => ((v - 32) * 5/9) + 273.15 },
    'k': { 'c': (v: number) => v - 273.15, 'f': (v: number) => ((v - 273.15) * 9/5) + 32 }
  };

  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  if (fromLower === toLower) {
    return { value: value.toString(), label: `${value} ${to}`, detail: 'Same unit' };
  }

  const conversionRate = conversions[fromLower]?.[toLower];
  let result: number;

  if (typeof conversionRate === 'function') {
    result = conversionRate(value);
  } else if (typeof conversionRate === 'number') {
    result = value * conversionRate;
  } else {
    return { value: 'N/A', label: 'Conversion not available', detail: 'Try different units' };
  }

  return {
    value: result.toLocaleString(undefined, { maximumFractionDigits: 4 }),
    label: `${to.toUpperCase()}`,
    detail: `${value} ${from} = ${result.toFixed(4)} ${to}`,
    stats: { 'Input': `${value} ${from}`, 'Output': `${result.toFixed(4)} ${to}` }
  };
}

// GPA Calculator
export function gpaCalc(courses: { grade: string; credits: number }[]): CalcToolResult {
  const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };

  let totalPoints = 0;
  let totalCredits = 0;

  courses.forEach(course => {
    const points = gradePoints[course.grade] ?? 0;
    totalPoints += points * course.credits;
    totalCredits += course.credits;
  });

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  let standing = 'Good Standing';
  if (gpa >= 3.9) standing = 'Summa Cum Laude';
  else if (gpa >= 3.7) standing = 'Magna Cum Laude';
  else if (gpa >= 3.5) standing = 'Cum Laude';
  else if (gpa >= 3.0) standing = 'Dean\'s List';
  else if (gpa < 2.0) standing = 'Academic Probation';

  return {
    value: gpa.toFixed(2),
    label: 'Cumulative GPA',
    detail: standing,
    stats: {
      'GPA': gpa.toFixed(3),
      'Total Credits': totalCredits,
      'Total Points': totalPoints.toFixed(1),
      'Standing': standing
    }
  };
}

// Process calculator based on tool ID
export function processCalcTool(toolId: string, inputs: any): CalcToolResult {
  switch (toolId) {
    case 'percentage-calc':
      return percentageCalc(parseFloat(inputs.a) || 0, parseFloat(inputs.b) || 0);
    case 'discount-calc':
      return discountCalc(parseFloat(inputs.price) || 0, parseFloat(inputs.discount) || 0);
    case 'date-calc':
      return dateCalc(inputs.date1 || inputs.date, inputs.date2);
    case 'age-calc':
      return ageCalc(inputs.date || inputs.birthDate);
    case 'bmi-calc':
      return bmiCalc(parseFloat(inputs.weight) || 0, parseFloat(inputs.height) || 0);
    case 'unit-converter':
      return unitConverter(parseFloat(inputs.val) || 0, inputs.from || 'm', inputs.to || 'ft');
    case 'gpa-calc':
      return gpaCalc(inputs.courses || []);
    default:
      return { value: '0', label: 'Result' };
  }
}
