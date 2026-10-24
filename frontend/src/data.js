export const links = [['/', 'Home'], ['/about', 'About'], ['/gallery', 'Gallery'], ['/admissions', 'Admissions'], ['/principal', 'Principal'], ['/student-life', 'Student Life']]
export const faqs = [
  ['Which classes are available?', 'Alice Public School teaches Nursery through Class V.'],
  ['How do I apply?', 'Visit the school, submit proof of age and address, and bring previous school records if available.'],
  ['Where is the school?', '155E, Khajoor Rd, Block C, Molarband Extension, Badarpur, New Delhi, Delhi 110044.'],
  ['How can I contact the school?', 'Call +91 98991 37983 or send an enquiry through the Admissions page.'],
]
export const clubs = [
  ['📚', 'Core academics', 'Language, mathematics, and environmental studies with regular assessment.', 'c1'],
  ['⚽', 'Sports & play', 'Physical activity and friendly games through the year.', 'c2'],
  ['🎨', 'Art & craft', 'Creative sessions that give students a break from the textbook.', 'c3'],
  ['🎉', 'Annual events', 'Assemblies, exhibitions, and celebrations that bring the school together.', 'c4'],
]
export const cats = ['All', 'School Events', 'Sports', 'Classrooms', 'Cultural Activities', 'Trips']
export const photos = Array.from({ length: 15 }, (_, i) => ({ id: i, cat: cats[(i % 5) + 1], src: `/images/photo${i + 1}.svg` }))
