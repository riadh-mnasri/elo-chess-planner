export function computeAge(birthDate: Date | null, referenceDate: Date): number | null {
  if (birthDate === null) {
    return null;
  }

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const hadBirthdayThisYear =
    referenceDate.getMonth() > birthDate.getMonth() ||
    (referenceDate.getMonth() === birthDate.getMonth() &&
      referenceDate.getDate() >= birthDate.getDate());

  if (!hadBirthdayThisYear) {
    age -= 1;
  }

  return age;
}
