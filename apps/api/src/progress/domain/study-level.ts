export class StudyLevel {
  static compute(coverage: number): number {
    if (coverage >= 0.75) return 3;
    if (coverage >= 0.5) return 2;
    if (coverage >= 0.25) return 1;
    return 0;
  }
}
