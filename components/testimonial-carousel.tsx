"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";

import React from "react";

const testimonials = [
  {
    name: "Veloist",
    image: "https://sea1.discourse-cdn.com/infiniteflight/user_avatar/community.infiniteflight.com/veloist/288/1509072_2.png",
    role: "Emirates Virtual Staff Member",
    text: "IFlytics is the logbook and database I’ve always wanted, and the best part is you don’t have to enter any information in, just fly in IF and watch your stats grow. Or, look back at your history and see the variety of routes and aircrafts you’ve flown in! This site/app has been awesome for helping me keep and stay on track as I tackle VA operations and my personal flight goals. I can no longer imagine myself using IF without IFlytics, and I highly recommend it to those interested in their own IF endeavors!",
  },
  {
    name: "Saf",
    image: "https://sea1.discourse-cdn.com/infiniteflight/user_avatar/community.infiniteflight.com/saf/288/1444486_2.png",
    role: "IF Remote Developer",
    text: "IFlytics is a fantastic addition to the third party space in the community, presenting data in a new human-friendly way from the start. It has been awesome seeing it evolve with each iteration, putting an interesting spin on the traditional way we look at data.",
  }, 
  {
    name: "Tintin",
    image: "https://sea1.discourse-cdn.com/infiniteflight/user_avatar/community.infiniteflight.com/tintin/288/1550895_2.png",
    role: "IF Appeals/IFVARB Leader",
    text: "IFlytics has completely transformed how I track my flights in Infinite Flight. It provides incredibly accurate data on routes, landings, and flight stats, all in one clean dashboard. I can even monitor other pilots in real time and view detailed flight histories. I’ve linked my personal IFlytics profile to the Infinite Flight Community so others can see my stats too.",
  },
  {
    name: "Daeng-E",
    image: "https://sea1.discourse-cdn.com/infiniteflight/user_avatar/community.infiniteflight.com/daeng-e/288/1498655_2.png",
    role: "IF Appeals",
    text: "Being part of IFlytics from the very beginning has been an amazing experience. It’s more than just an app, it feels like having a co-pilot by my side. It’s helped me make smarter choices in the air and understand my flights better afterward. IFlytics truly takes the Infinite Flight experience to the next level",
  },
  {
    name: "JeppyG",
    image: "https://sea1.discourse-cdn.com/infiniteflight/user_avatar/community.infiniteflight.com/jeppyg/288/1434629_2.png",
    role: "IFATC Officer",
    text: "As someone who loves neatly presented data and thrives on digging into stats, IFlytics has been a breath of fresh air, especially since other third-party tools are always about flight tracking (nothing wrong with that, though). IFlytics stands out with its clean interface, intuitive layout, and an amazing take on how statistics are delivered.",
  },
]

const TestimonialCarousel = () => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 4000, // 4 seconds between slides
          stopOnInteraction: true, // Stop autoplay when user interacts
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {/* Testimonial 1 */}
        {testimonials.map((testimonial, index) => (
        <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
          <div className="p-1">
            <Card className="h-full">
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 flex-1 italic">
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
        ))}
       
      </CarouselContent>

      <CarouselPrevious className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" />
      <CarouselNext className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" />
    </Carousel>
  );
};

export default TestimonialCarousel;
