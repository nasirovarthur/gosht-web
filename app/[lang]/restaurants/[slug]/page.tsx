import RestaurantDetail from "@/components/RestaurantDetail";

// Моки данные для вёрстки
const mockRestaurant = {
  name: "GOSHT",
  branchName: "GOSHT RESTAURANT CITY",
  address: "Ташкент, улица Амира Темура, 12",
  phone: "+998 (71) 200-00-00",
  whatsapp: "https://wa.me/998712000000",
  workingHours: "11:00 - 23:00",
  averageCheck: "150 000 - 300 000 сўм",
  description:
    "GOSHT — это концепция гастрономического пространства, где традиционная узбекская кухня встречается с современным подходом к сервису и атмосфере.",
  descriptionExtended:
    "Мы верим в силу подлинного вкуса и качества ингредиентов, создавая блюда, которые объединяют традиции и современность.",
  yearOpened: "2021",
  menu: "/menu.pdf",
  gallery: [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=900&fit=crop",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=900&fit=crop",
    "https://images.unsplash.com/photo-1504674900969-f2df05b3252d?w=1200&h=900&fit=crop",
  ],
  mapLink:
    "https://www.google.com/maps/place/Tashkent",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2997.4151329093486!2d69.2081221!3d41.2994937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8ba57974bf15%3A0x47a1ff3d054dfd0!2sNavro%27i%20Sharif%20Street%2C%20Tashkent!5e0!3m2!1sen!2suz!4v1234567890",
};

export default async function RestaurantPage() {
  // Позже здесь будет загрузка данных из Sanity по slug

  return <RestaurantDetail restaurant={mockRestaurant} />;
}
