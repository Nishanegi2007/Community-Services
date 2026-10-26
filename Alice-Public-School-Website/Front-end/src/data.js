export const BASE = 'https://alicepublicschool.vercel.app/photos/'
const web = (w, lock) => `https://loremflickr.com/640/480/${w}?lock=${lock}`

export const stages = [
  ['Pre-primary', 'Nursery to UKG', 'Play-based learning: early language, numbers, stories, music and movement.'],
  ['Primary', 'Grades 1 to 5', 'Strong basics in English, maths, science and social studies, with art and sport every week.'],
  ['Middle', 'Grades 6 to 8', 'Subject teachers, lab work, computer classes and first projects and debates.'],
  ['Secondary', 'Grades 9 to 10', 'Board exam preparation with regular tests, doubt classes and career guidance.'],
  ['Senior secondary', 'Grades 11 to 12', 'Science, Commerce and Humanities streams with counselling for college entry.'],
]
export const facilities = [
  ['Library', 'Quiet reading hall with over 10,000 books.'],
  ['Science labs', 'Physics, chemistry and biology labs for hands-on work.'],
  ['Computer lab', 'Networked computers for coding and digital skills.'],
  ['Sports ground', 'Football, cricket, basketball and a running track.'],
  ['Auditorium', 'Seats 500 for assemblies, plays and prize days.'],
  ['Transport', 'School buses covering the main routes in town.'],
]
export const pics = [
  ['Sports Day', web('sports,athletics', 11)],
  ['Science Fair', web('science,experiment', 12)],
  ['Annual Function', BASE + 'gallery-3.jpg'],
  ['Art Class', BASE + 'gallery-4.jpg'],
  ['Independence Day', BASE + 'gallery-1.jpg'],
  ['Tree Plantation', web('tree,planting', 13)],
  ['Music Evening', BASE + 'gallery-7.jpg'],
  ['Class Trip', BASE + 'gallery-5.jpg'],
]
export const news = [
  ['12 Oct', 'Annual Sports Day: track and field events for all grades.'],
  ['02 Nov', 'Science Exhibition: student projects open to parents.'],
  ['20 Nov', 'Admissions open for the next academic session.'],
]
export const steps = [
  ['Send an enquiry', 'Fill the contact form below or call the school office.'],
  ['Visit the campus', 'Meet the teachers and see classrooms and labs.'],
  ['Submit documents', 'Birth certificate, previous report card, address proof and photographs.'],
  ['Confirm the seat', "Pay the admission fee once the school confirms your child's seat."],
]
export const links = [['about','About'],['principal','Principal'],['academics','Academics'],['facilities','Facilities'],['gallery','Gallery'],['admissions','Admissions']]
