import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Globe, MessageSquare, MapPin, HelpCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/lib/index';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

type Language = 'en' | 'ha';

const SUGGESTED_QUESTIONS = {
  en: [
    'How do I top up my wallet?',
    'Show me travel packages',
    'Find tutors near me',
    'How to report an emergency?',
    'What events are happening?',
    'Tell me about religious services',
  ],
  ha: [
    'Yaya zan cika wallet dina?',
    'Nuna mini shirye-shiryen tafiya',
    'Nemo malamai kusa da ni',
    'Yaya zan bayar da rahoton gaggawa?',
    'Wane abubuwan da ke faruwa?',
    'Faɗa mini game da hidimar addini',
  ],
};

const HELP_CATEGORIES = {
  en: [
    { icon: MessageSquare, label: 'Navigation Help', query: 'How do I navigate the app?' },
    { icon: MapPin, label: 'Tourism Info', query: 'Tell me about tourist attractions' },
    { icon: HelpCircle, label: 'Account Help', query: 'How do I manage my account?' },
    { icon: Calendar, label: 'Service Booking', query: 'How do I book services?' },
  ],
  ha: [
    { icon: MessageSquare, label: 'Taimakon Kewayawa', query: 'Yaya zan yi amfani da app?' },
    { icon: MapPin, label: 'Bayanan Yawon Shakatawa', query: 'Faɗa mini game da wuraren yawon shakatawa' },
    { icon: HelpCircle, label: 'Taimakon Asusun', query: 'Yaya zan sarrafa asusuna?' },
    { icon: Calendar, label: 'Yin Ajiyar Sabis', query: 'Yaya zan yi ajiyar sabis?' },
  ],
};

const AI_RESPONSES = {
  en: {
    greeting: "Hello! I'm your Trunorth AI assistant. How can I help you today?",
    wallet: 'To top up your wallet, go to the Wallet page and click the "Top Up" button. You can add funds using your bank card or mobile money.',
    travel: 'You can browse our travel packages on the Travel page. We offer various destinations with different price ranges and durations.',
    tutors: 'Visit the Tutoring page to find qualified tutors. You can filter by subject, price, and availability.',
    emergency: 'For emergencies, click the Emergency button on the homepage or go to the Emergency page. Select the type of emergency and provide details.',
    events: 'Check out the Events page to see upcoming concerts, conferences, sports events, and more. You can purchase tickets directly.',
    religious: 'The Religious Services page lists upcoming prayer sessions, sermons, and study groups. You can register for services that interest you.',
    navigation: 'Use the sidebar menu to navigate between different sections: Home, Wallet, Social, Travel, Tutoring, Emergency, Donations, Marketplace, Events, Religious Services, Profile, and Settings.',
    tourism: 'Nigeria offers amazing tourist attractions including Yankari National Park, Olumo Rock, Lekki Conservation Centre, and many cultural festivals throughout the year.',
    account: 'Manage your account by going to Profile to update personal information, or Settings to adjust preferences, notifications, and security options.',
    booking: 'To book services: 1) Browse the service page (Travel, Tutoring, Events, etc.), 2) Select what you want, 3) Click the booking button, 4) Complete payment using your wallet.',
    default: "I'm here to help! You can ask me about navigating the app, booking services, managing your wallet, or finding information about travel, tutoring, events, and more.",
  },
  ha: {
    greeting: 'Sannu! Ni ne mataimakinka na Trunorth AI. Yaya zan taimake ka yau?',
    wallet: 'Don cika wallet ɗinka, je zuwa shafin Wallet kuma danna maɓallin "Cika". Zaka iya ƙara kuɗi ta amfani da katin banki ko kuɗin wayar hannu.',
    travel: 'Zaka iya duba shirye-shiryen tafiyarmu a shafin Tafiya. Muna ba da wurare daban-daban tare da farashi da lokaci daban-daban.',
    tutors: 'Ziyarci shafin Koyarwa don nemo malamai masu cancanta. Zaka iya tace ta hanyar darasi, farashi, da samuwa.',
    emergency: 'Don gaggawa, danna maɓallin Gaggawa a shafin gida ko je zuwa shafin Gaggawa. Zaɓi nau\'in gaggawa kuma bayar da cikakkun bayanai.',
    events: 'Duba shafin Abubuwan da ke faruwa don ganin wasannin kide-kide, tarurruka, wasannin motsa jiki, da sauransu. Zaka iya siyan tikiti kai tsaye.',
    religious: 'Shafin Hidimar Addini yana lissafin sallar da ke tafe, wa\'azi, da ƙungiyoyin karatu. Zaka iya yin rajista don ayyukan da suka shafe ka.',
    navigation: 'Yi amfani da menu na gefe don kewaya tsakanin sassa daban-daban: Gida, Wallet, Zamantakewa, Tafiya, Koyarwa, Gaggawa, Gudummawa, Kasuwa, Abubuwa, Hidimar Addini, Bayanan Sirri, da Saiti.',
    tourism: 'Najeriya tana da wuraren yawon shakatawa masu ban sha\'awa kamar Yankari National Park, Dutsen Olumo, Lekki Conservation Centre, da bukukuwan al\'adu da yawa a duk shekara.',
    account: 'Sarrafa asusunka ta hanyar zuwa Bayanan Sirri don sabunta bayanan sirri, ko Saiti don daidaita abubuwan da ka fi so, sanarwa, da zaɓuɓɓukan tsaro.',
    booking: 'Don yin ajiyar sabis: 1) Duba shafin sabis (Tafiya, Koyarwa, Abubuwa, da sauransu), 2) Zaɓi abin da kake so, 3) Danna maɓallin ajiya, 4) Kammala biyan kuɗi ta amfani da wallet ɗinka.',
    default: 'Ina nan don taimako! Zaka iya tambaye ni game da kewaya app, yin ajiyar sabis, sarrafa wallet ɗinka, ko neman bayani game da tafiya, koyarwa, abubuwa, da sauransu.',
  },
};

function getAIResponse(query: string, language: Language): string {
  const responses = AI_RESPONSES[language];
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('wallet') || lowerQuery.includes('top up') || lowerQuery.includes('cika')) {
    return responses.wallet;
  }
  if (lowerQuery.includes('travel') || lowerQuery.includes('package') || lowerQuery.includes('tafiya')) {
    return responses.travel;
  }
  if (lowerQuery.includes('tutor') || lowerQuery.includes('teacher') || lowerQuery.includes('malami')) {
    return responses.tutors;
  }
  if (lowerQuery.includes('emergency') || lowerQuery.includes('gaggawa')) {
    return responses.emergency;
  }
  if (lowerQuery.includes('event') || lowerQuery.includes('concert') || lowerQuery.includes('abubuwa')) {
    return responses.events;
  }
  if (lowerQuery.includes('religious') || lowerQuery.includes('prayer') || lowerQuery.includes('addini')) {
    return responses.religious;
  }
  if (lowerQuery.includes('navigate') || lowerQuery.includes('kewaya')) {
    return responses.navigation;
  }
  if (lowerQuery.includes('tourism') || lowerQuery.includes('tourist') || lowerQuery.includes('shakatawa')) {
    return responses.tourism;
  }
  if (lowerQuery.includes('account') || lowerQuery.includes('profile') || lowerQuery.includes('asusun')) {
    return responses.account;
  }
  if (lowerQuery.includes('book') || lowerQuery.includes('ajiya')) {
    return responses.booking;
  }

  return responses.default;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: AI_RESPONSES.en.greeting,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (content?: string) => {
    const messageContent = content || input.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(messageContent, language),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: AI_RESPONSES[language].greeting,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'ha' : 'en';
    setLanguage(newLang);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: AI_RESPONSES[newLang].greeting,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">AI Assistant</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'en'
                ? 'Ask me anything about Trunorth services'
                : 'Tambaye ni komai game da sabis na Trunorth'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleLanguage}>
              <Globe className="h-4 w-4 mr-2" />
              {language === 'en' ? 'English' : 'Hausa'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Clear' : 'Share'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {HELP_CATEGORIES[language].map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleSend(category.query)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[70%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border'
                      } rounded-2xl px-4 py-3`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <motion.div
                        className="w-2 h-2 bg-muted-foreground rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-muted-foreground rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-muted-foreground rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Suggested Questions:' : 'Tambayoyin da aka ba da shawara:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS[language].map((question, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent transition-colors px-3 py-1.5"
                      onClick={() => handleSend(question)}
                    >
                      {question}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border bg-card px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'en' ? 'Type your message...' : 'Rubuta saƙonka...'
            }
            className="flex-1"
            disabled={isTyping}
          />
          <Button type="submit" disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
