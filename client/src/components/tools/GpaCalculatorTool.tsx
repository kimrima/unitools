import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  grade: string;
  credits: string;
}

const gradePoints: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

export default function GpaCalculatorTool() {
  const { t } = useTranslation();
  const tk = (key: string) => t(`Tools.gpa-calculator.${key}`);

  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: '', grade: 'A', credits: '3' },
    { id: 2, name: '', grade: 'B+', credits: '3' },
    { id: 3, name: '', grade: 'A-', credits: '4' },
  ]);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), name: '', grade: 'A', credits: '3' }]);
  };

  const removeCourse = (id: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  const updateCourse = (id: number, field: keyof Course, value: string) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
      const credits = parseFloat(course.credits) || 0;
      const points = gradePoints[course.grade] || 0;
      totalPoints += points * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const gpa = calculateGPA();
  const totalCredits = courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          {courses.map((course, idx) => (
            <div key={course.id} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                {idx === 0 && <Label className="text-xs">{tk('course')}</Label>}
                <Input
                  placeholder={tk('courseName')}
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  data-testid={`input-course-${idx}`}
                />
              </div>
              <div className="w-24 space-y-1">
                {idx === 0 && <Label className="text-xs">{tk('grade')}</Label>}
                <Select value={course.grade} onValueChange={(v) => updateCourse(course.id, 'grade', v)}>
                  <SelectTrigger data-testid={`select-grade-${idx}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(gradePoints).map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20 space-y-1">
                {idx === 0 && <Label className="text-xs">{tk('credits')}</Label>}
                <Input
                  type="number"
                  inputMode="numeric"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                  data-testid={`input-credits-${idx}`}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCourse(course.id)}
                disabled={courses.length <= 1}
                data-testid={`btn-remove-${idx}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addCourse} className="w-full" data-testid="btn-add">
            <Plus className="w-4 h-4 mr-2" />
            {tk('addCourse')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground">{tk('gpa')}</div>
              <div className="text-4xl font-bold" data-testid="gpa-result">{gpa}</div>
              <div className="text-sm text-muted-foreground">{tk('outOf')} 4.0</div>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground">{tk('totalCredits')}</div>
              <div className="text-4xl font-bold" data-testid="total-credits">{totalCredits}</div>
              <div className="text-sm text-muted-foreground">{tk('credits')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
