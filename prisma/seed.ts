import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Buat sample course
  const course = await prisma.course.create({
    data: {
      title: "Complete guide to fishing",
      description: "Kursus lengkap tentang Memancing untuk pemula.",
      thumbnail: "https://nyrqxuqllmmwintrblml.supabase.co/storage/v1/object/public/thumbnail//Capture-2025-02-10-150028.png",
      price: 100,
      level: "BEGINNER",
      status: "PUBLISHED",
      instructorId: "instructor-id-sample", // Ganti dengan id instructor yang valid di database
      categoryId: "category-id-sample", // Ganti jika ada kategori
    },
  });

  // Buat sample section untuk course
  const section = await prisma.section.create({
    data: {
      title: "Pengenalan dan Dasar",
      order: 1,
      courseId: course.id,
    },
  });

  // Buat sample lesson dengan video YouTube
  await prisma.lesson.create({
    data: {
      title: "Introduction to Framework X",
      // content: 'Silakan tonton video berikut untuk pengenalan:',
      duration: 600, // dalam detik
      order: 1,
      type: "VIDEO",
      isPublished: true,
      sectionId: section.id,
      // Simpan URL video YouTube
      // Misalnya, bisa disimpan di kolom content atau di kolom baru jika ada
      // Dalam contoh ini, simpan di field content sebagai referensi
      content:
        "https://youtu.be/FAbfCJaPtHo?list=PLrLt2hopxXhWPishlUyPGqqjkZbtwvoEA",
    },
  });

  console.log("Seed data berhasil ditambahkan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
