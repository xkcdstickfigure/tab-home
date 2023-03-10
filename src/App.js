import { useState, useEffect } from "react";
import axios from "axios";
import { get as getCookie } from "es-cookie";
import "./App.css";

import { Hero } from "./Hero";
import { Footer } from "./Footer";
import { MessageSquare } from "react-feather";

import { Card } from "./Card";
import { WeatherCard } from "./Card/Weather";
import { NewsCard } from "./Card/News";
import { ProfileCard } from "./Card/Profile";
import { PeopleCard } from "./Card/People";
import { StatusCard } from "./Card/Status";
import { ToDoCard } from "./Card/ToDo";
import { DateCard } from "./Card/Date";

export const App = () => {
  const hp = 1;
  const ext = window.browser?.runtime.getManifest().version || "0";

  const [data, setData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const browserStorage =
          typeof browser !== "undefined"
            ? await window.browser.storage.local.get(["api", "token"])
            : {};
        const api =
          getCookie("protium-api") ||
          browserStorage.api ||
          "https://tab.alles.cx/c";
        const token = getCookie("protium-token") || browserStorage.token;
        setData({
          api,
          token,
          ...(
            await axios.get(`${api}/hp?hp=${hp}&ext=${ext}`, {
              headers: { Authorization: token },
            })
          ).data,
        });
      } catch (err) {
        if (err?.response?.data === "Bad Authorization")
          window.location.href = "https://tab.alles.cx/connect";
      }
    };

    fetchData();
    const i = setInterval(fetchData, 2500);
    return () => clearInterval(i);
  }, [ext]);

  return (
    data &&
    (data.unsupported ? (
      <p className="p-5 text-center">
        This version of Alles Tab is no longer supported.
      </p>
    ) : (
      <div className="space-y-10">
        <Hero
          userId={data.user.id}
          image={data.background}
          sites={data.sites}
        />

        <div className="mx-auto max-w-3xl grid gap-3 grid-cols-5">
          {data.news.length > 0 ? (
            <NewsCard width={3} height={2} items={data.news} />
          ) : (
            <Card
              width={3}
              height={2}
              className="flex flex-col justify-center text-center space-y-4"
            >
              <MessageSquare
                className="mx-auto"
                size={48}
                stroke="#4b5563"
                fill="#d1d5db"
              />
              <div className="space-y-1">
                <p className="text-lg text-gray-600">
                  Want to chat with the Alles community?
                </p>
                <p className="text-primary uppercase font-semibold text-sm">
                  <a href="https://discord.alles.cx">Join our discord server</a>
                </p>
              </div>
            </Card>
          )}
          <ProfileCard
            width={2}
            nickname={data.user.nickname}
            email={data.user.email}
          />
          <PeopleCard width={2} height={2} people={data.people} />
          <ToDoCard
            width={2}
            height={2}
            api={data.api}
            token={data.token}
            items={data.todo}
          />
          <WeatherCard
            symbol={data.weather.symbol}
            temperature={data.weather.temperature}
            location={data.location}
          />
          <StatusCard
            width={2}
            api={data.api}
            token={data.token}
            status={data.status}
          />
          <DateCard />

          {data.cards.map((card, i) => {
            const content = card.image && (
              <img src={card.image} alt="" className="w-full h-full" />
            );
            return (
              <Card
                key={i}
                width={card.width}
                height={card.height}
                className="select-none"
              >
                {card.url ? <a href={card.url}>{content}</a> : content}
              </Card>
            );
          })}
        </div>

        <Footer hp={hp} ext={ext} />
      </div>
    ))
  );
};
