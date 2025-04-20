"use client";

import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import { Bird, ChevronRight, Cloud, RefreshCwIcon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function FarmStory() {
  const router = useRouter();
  const [stage, setStage] = useState<
    "intro" | "choice" | "sell" | "stay" | "final-sell" | "final-stay"
  >("intro");
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const introPages = [
    "После долгих лет работы в шумном городе, вы решили оставить всё позади и начать новую жизнь в тихой деревне 'Солнечная Долина'.",
    "Вы купили старую ферму с красным домом, ветряной мельницей и плодородными полями, простирающимися до горизонта.",
    "Прошло три года. Вы вложили душу в эту землю. Каждый камень, каждое дерево хранит ваши воспоминания.",
    "Но недавно вам позвонил представитель крупной агрокомпании AgroUnity. Они предлагают купить вашу ферму за хорошие деньги. Вы решаете продать ферму или нет?",
  ];

  const handleNext = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (stage === "intro") {
      if (currentPage < introPages.length - 1) {
        setCurrentPage(currentPage + 1);
      } else {
        setStage("choice");
        setCurrentPage(0);
      }
    } else if (stage === "sell") {
      setStage("final-sell");
    } else if (stage === "stay") {
      setStage("final-stay");
    }

    setTimeout(() => setIsAnimating(false), 1000);
  };

  const handleRestart = () => {
    localStorage.removeItem("damfarm-game-storage");
    router.push("/");
  };

  const handleChoice = (choice: "sell" | "stay") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setStage(choice);
      setIsAnimating(false);
    }, 1000);
  };

  const randomPosition = () => {
    return {
      x: Math.random() * 100,
      y: Math.random() * 30,
      delay: Math.random() * 5,
    };
  };

  const clouds = Array.from({ length: 5 }, (_, i) => randomPosition());

  const birds = Array.from({ length: 8 }, (_, i) => randomPosition());

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-b from-[#29b6f6] to-[#2196f3]">
      {/* Animated sun */}
      <motion.div
        className="absolute right-10 top-10"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: {
            duration: 60,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
          scale: {
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
      >
        <Sun className="h-20 w-20 text-yellow-300" />
      </motion.div>

      {/* Animated clouds */}
      {clouds.map((cloud, index) => (
        <motion.div
          key={`cloud-${index}`}
          className="absolute"
          initial={{ x: `${cloud.x}vw`, y: `${cloud.y}vh` }}
          animate={{
            x: [`${cloud.x}vw`, `${(cloud.x + 20) % 100}vw`, `${cloud.x}vw`],
          }}
          transition={{
            duration: 30 + cloud.delay * 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: cloud.delay,
          }}
        >
          <Cloud className="h-8 w-8 text-white" />
        </motion.div>
      ))}

      {/* Animated birds */}
      {birds.map((bird, index) => (
        <motion.div
          key={`bird-${index}`}
          className="absolute"
          initial={{ x: `-10vw`, y: `${bird.y + 10}vh` }}
          animate={{
            x: [`-10vw`, `110vw`, `-10vw`],
            y: [
              `${bird.y + 10}vh`,
              `${(bird.y + 15) % 30}vh`,
              `${bird.y + 10}vh`,
            ],
          }}
          transition={{
            duration: 20 + bird.delay * 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: bird.delay * 3,
          }}
        >
          <Bird className="h-4 w-4 text-black" />
        </motion.div>
      ))}

      {/* Farm background */}
      <div className="absolute bottom-0 w-full h-[60vh] bg-gradient-to-b from-[#5d4037] to-[#3e2723] overflow-hidden">
        {/* Farm rows */}
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={`row-${index}`}
            className="absolute w-full h-[5vh]"
            style={{
              bottom: `${index * 5}vh`,
              backgroundColor: index % 2 === 0 ? "#8d6e63" : "#795548",
              zIndex: 1,
            }}
          />
        ))}

        {/* Fence */}
        <div className="absolute bottom-[30vh] w-full h-[5vh] flex items-end">
          {Array.from({ length: 40 }).map((_, index) => (
            <div
              key={`fence-${index}`}
              className="h-[3vh] w-[2.5vw] bg-[#ff8a65]"
              style={{
                marginRight: "0.5vw",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
              }}
            />
          ))}
        </div>

        {/* Red house */}
        <motion.div
          className="absolute bottom-[30vh] left-[15vw] w-[10vw] h-[15vh] bg-[#d32f2f] z-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Roof */}
          <div className="absolute top-[-5vh] left-0 w-0 h-0 border-l-[5vw] border-r-[5vw] border-b-[5vh] border-l-transparent border-r-transparent border-b-[#b71c1c]" />
          {/* Window */}
          <div className="absolute top-[3vh] left-[3vw] w-[3vw] h-[3vh] bg-[#ffeb3b]" />
        </motion.div>

        {/* Windmill */}
        <motion.div className="absolute bottom-[30vh] right-[15vw] z-10">
          <div className="w-[8vw] h-[20vh] bg-[#e6e6e6] relative">
            {/* Windmill blades */}
            <motion.div
              className="absolute top-[2vh] left-[4vw]"
              animate={{ rotate: 360 }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <div className="absolute w-[1vw] h-[10vh] bg-[#8d6e63] left-[-0.5vw] top-[-10vh]" />
              <div className="absolute w-[1vw] h-[10vh] bg-[#8d6e63] left-[-0.5vw] bottom-[-10vh]" />
              <div className="absolute w-[10vh] h-[1vw] bg-[#8d6e63] left-[-10vh] top-[-0.5vw]" />
              <div className="absolute w-[10vh] h-[1vw] bg-[#8d6e63] right-[-10vh] top-[-0.5vw]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Crops */}
        {Array.from({ length: 30 }).map((_, index) => (
          <motion.div
            key={`crop-${index}`}
            className={`absolute rounded-full ${
              index % 3 === 0 ? "bg-[#ffd54f]" : "bg-[#66bb6a]"
            }`}
            style={{
              width: `${1 + Math.random() * 2}vw`,
              height: `${1 + Math.random() * 2}vw`,
              bottom: `${5 + Math.random() * 25}vh`,
              left: `${5 + Math.random() * 90}vw`,
              zIndex: 2,
            }}
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.1 * index,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              repeatDelay: 5 + Math.random() * 10,
            }}
          />
        ))}
      </div>

      {/* Story content */}
      <div className="min-h-screen flex items-center justify-center relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${stage}-${currentPage}`}
            className="w-[80vw] max-w-3xl bg-[#2979ff] bg-opacity-80 backdrop-blur-sm p-8 rounded-xl shadow-xl text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            {stage === "intro" && (
              <div className="text-center">
                <motion.p
                  className="text-xl md:text-2xl font-medium leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {introPages[currentPage]}
                </motion.p>

                <div className="mt-8 flex justify-center gap-2">
                  {introPages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        currentPage === index ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                <motion.div
                  className="mt-6 flex justify-end"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={handleNext}
                    className="bg-white text-[#2979ff] hover:bg-white/90 rounded-full px-6"
                    disabled={isAnimating}
                  >
                    Продолжить
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            )}

            {stage === "choice" && (
              <div className="text-center">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Что вы решите?
                </motion.h2>

                <motion.p
                  className="text-xl md:text-2xl font-medium leading-relaxed mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Продать ферму и начать новую жизнь в городе или остаться и
                  продолжить развивать своё хозяйство?
                </motion.p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white px-8 py-6 text-lg rounded-xl"
                      onClick={() => handleChoice("sell")}
                      disabled={isAnimating}
                    >
                      Продать ферму
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      className="bg-[#43a047] hover:bg-[#2e7d32] text-white px-8 py-6 text-lg rounded-xl"
                      onClick={() => handleChoice("stay")}
                      disabled={isAnimating}
                    >
                      Остаться на ферме
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}

            {stage === "sell" && (
              <div className="text-center">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold mb-6 text-[#ffcdd2]"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Вы решили продать ферму
                </motion.h2>

                <motion.p
                  className="text-xl font-medium leading-relaxed mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Вы позвонили представителю компании и согласились на их
                  предложение. Документы будут готовы через неделю.
                </motion.p>

                <motion.p
                  className="text-xl font-medium leading-relaxed mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Пока вы собираете вещи, вы вспоминаете все моменты,
                  проведённые здесь. Каждый уголок хранит воспоминания.
                </motion.p>

                <motion.div
                  className="mt-6 flex justify-end"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={handleNext}
                    className="bg-white text-[#2979ff] hover:bg-white/90 rounded-full px-6"
                    disabled={isAnimating}
                  >
                    Узнать, что будет дальше
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            )}

            {stage === "stay" && (
              <div className="text-center">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold mb-6 text-[#c8e6c9]"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Вы решили остаться на ферме
                </motion.h2>

                <motion.p
                  className="text-xl font-medium leading-relaxed mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Вы позвонили представителю компании и отказались от
                  предложения. Эта ферма — ваш дом, ваша жизнь.
                </motion.p>

                <motion.p
                  className="text-xl font-medium leading-relaxed mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Глядя на свои поля, вы понимаете, что не смогли бы расстаться
                  с этим местом. Здесь вы нашли своё призвание.
                </motion.p>

                <motion.div
                  className="mt-6 flex justify-end"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={handleNext}
                    className="bg-white text-[#2979ff] hover:bg-white/90 rounded-full px-6"
                    disabled={isAnimating}
                  >
                    Узнать, что будет дальше
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            )}

            {stage === "final-sell" && (
              <div className="text-center">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold mb-6 text-[#ffcdd2]"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Новая жизнь в городе
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-xl font-medium leading-relaxed mb-4">
                    {" "}
                    Прошло пять лет с тех пор, как вы продали ферму. Вы решили
                    начать новую жизнь, но вместо долгожданного облегчения все
                    оказалось совсем не так, как вы ожидали.{" "}
                  </p>{" "}
                  <p className="text-xl font-medium leading-relaxed mb-4">
                    {" "}
                    Деньги от продажи фермы вскоре исчезли. Агрокомпания,
                    пообещавшая вам стабильность, вскоре изменила условия сделки
                    и не выполнила обещаний. Вскоре стало ясно, что они
                    использовали вас, чтобы забрать землю и уничтожить малый
                    бизнес.{" "}
                  </p>{" "}
                  <p className="text-xl font-medium leading-relaxed mb-4">
                    {" "}
                    Вы потратили все деньги на создание нового бизнеса, который,
                    к сожалению, оказался убыточным. Вскоре пришлось закрыть
                    магазин и потерять практически все. Вернувшись в город, вы
                    столкнулись с реальностью финансового краха.{" "}
                  </p>{" "}
                  <p className="text-xl font-medium leading-relaxed mb-4">
                    {" "}
                    Иногда, когда вы гуляете по городу, в голове возникает мысль
                    о старой ферме. И о том, как все могло бы быть, если бы не
                    тот момент, когда вы подписали контракт с AgroUnity.{" "}
                  </p>{" "}
                  <p className="text-xl font-medium leading-relaxed">
                    {" "}
                    Каждый выбор ведёт к новой главе в жизни. Но этот выбор стал
                    ошибкой, которая оставила вас без всего. Теперь вам
                    предстоит начинать с нуля и восстанавливать свою жизнь после
                    предательства.{" "}
                  </p>
                </motion.div>

                <motion.div
                  className="mt-8 flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    onClick={handleRestart}
                    className="bg-white text-[#2979ff] hover:bg-white/90 rounded-full px-6"
                    disabled={isAnimating}
                  >
                    <RefreshCwIcon className="mr-2 h-4 w-4" />
                    Начать заново
                  </Button>
                </motion.div>
              </div>
            )}

            {stage === "final-stay" && (
              <div className="text-center">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold mb-6 text-[#c8e6c9]"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Процветающая ферма
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-xl font-medium leading-relaxed mb-4">
                    Прошло пять лет с тех пор, как вы отказались продать ферму.
                    За это время вы превратили её в настоящую жемчужину.
                  </p>

                  <p className="text-xl font-medium leading-relaxed mb-4">
                    Вы перешли на органическое земледелие, и ваши продукты стали
                    пользоваться огромным спросом в ближайшем городе.
                  </p>

                  <p className="text-xl font-medium leading-relaxed mb-4">
                    Вы открыли небольшой фермерский магазин прямо на территории
                    фермы, куда по выходным приезжают семьи из города, чтобы
                    купить свежие продукты и показать детям сельскую жизнь.
                  </p>

                  <p className="text-xl font-medium leading-relaxed mb-4">
                    Однажды к вам заехал тот самый представитель компании,
                    который когда-то предлагал купить ферму. Он был удивлён,
                    увидев, как преобразилось это место.
                  </p>

                  <p className="text-xl font-medium leading-relaxed">
                    "Не жалеете, что не продали?" — спросил он. Вы улыбнулись и
                    покачали головой. Иногда лучшие решения — те, которые идут
                    от сердца.
                  </p>
                </motion.div>

                <motion.div
                  className="mt-8 flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    onClick={handleRestart}
                    className="bg-white text-[#2979ff] hover:bg-white/90 rounded-full px-6"
                    disabled={isAnimating}
                  >
                    <RefreshCwIcon className="mr-2 h-4 w-4" />
                    Начать заново
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
