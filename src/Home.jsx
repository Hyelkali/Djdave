import React, { useState, useEffect, useRef } from 'react';
import { Music, Calendar, Mail, Sun, Moon, Menu, X, Play, Pause, SkipBack, SkipForward, Plus, Share2, Trash2 } from 'lucide-react';
import emailjs from 'emailjs-com';
import Atclub from './assets/images/AtClub.jpg'
import DJ from './assets/images/DjOnBeats.jpg'
import lonk from './assets/images/Lonk.jpg'

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [songs, setSongs] = useState([]);
  const [events, setEvents] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState('song');
  const [adminPassword, setAdminPassword] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const savedSongs = JSON.parse(localStorage.getItem('songs') || '[]');
    const savedEvents = JSON.parse(localStorage.getItem('events') || '[]');
    setSongs(savedSongs);
    setEvents(savedEvents);
    
    setTimeout(() => setIsLoading(false), 3000);

    const timer = setTimeout(() => setIsSubscribeModalOpen(true), 9000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'music', 'events', 'contact'];
      let current = '';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            current = section;
          }
        }
      }

      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.toLowerCase();
    const results = [
      ...songs.filter(song => 
        song.title.toLowerCase().includes(term) ||
        song.artist.toLowerCase().includes(term)
      ),
      ...events.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term) ||
        event.date.toLowerCase().includes(term)
      )
    ];
    setSearchResults(results);
  };

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = song.audioFile;
      audioRef.current.play();
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    if (currentIndex < playlist.length - 1) {
      playSong(playlist[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(playlist[currentIndex - 1]);
    }
  };

  const addToPlaylist = (song) => {
    if (!playlist.some(item => item.id === song.id)) {
      setPlaylist([...playlist, song]);
      alert(`${song.title} has been added to your playlist.`);
    }
  };

  const removeFromPlaylist = (songId) => {
    setPlaylist(playlist.filter(song => song.id !== songId));
  };

  const shareSong = (song) => {
    const shareUrl = `${window.location.origin}/song/${song.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`Share link for "${song.title}" has been copied to clipboard.`);
    });
  };

  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (uploadType === 'song') {
      const newSong = {
        id: editItem ? editItem.id : Date.now(),
        title: formData.get('title'),
        artist: formData.get('artist'),
        audioFile: formData.get('audioFile') instanceof File ? URL.createObjectURL(formData.get('audioFile')) : editItem.audioFile,
        coverImage: formData.get('coverImage') instanceof File ? URL.createObjectURL(formData.get('coverImage')) : editItem.coverImage,
      };
      if (editItem) {
        setSongs(songs.map(song => song.id === editItem.id ? newSong : song));
      } else {
        setSongs([...songs, newSong]);
      }
      localStorage.setItem('songs', JSON.stringify(editItem ? songs.map(song => song.id === editItem.id ? newSong : song) : [...songs, newSong]));
    } else {
      const newEvent = {
        id: editItem ? editItem.id : Date.now(),
        title: formData.get('title'),
        date: formData.get('date'),
        location: formData.get('location'),
        image: formData.get('image') instanceof File ? URL.createObjectURL(formData.get('image')) : editItem.image,
      };
      if (editItem) {
        setEvents(events.map(event => event.id === editItem.id ? newEvent : event));
      } else {
        setEvents([...events, newEvent]);
      }
      localStorage.setItem('events', JSON.stringify(editItem ? events.map(event => event.id === editItem.id ? newEvent : event) : [...events, newEvent]));
    }

    setEditItem(null);
    e.target.reset();
    alert(`${editItem ? 'Updated' : 'New'} ${uploadType} ${editItem ? 'updated' : 'uploaded'} successfully`);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === 'admindave') {
      setAdminPassword('');
      setIsUploadModalOpen(true);
    } else {
      alert("Invalid admin password");
    }
  };

  const deleteItem = (item, type) => {
    if (type === 'song') {
      setSongs(songs.filter(song => song.id !== item.id));
      localStorage.setItem('songs', JSON.stringify(songs.filter(song => song.id !== item.id)));
    } else {
      setEvents(events.filter(event => event.id !== item.id));
      localStorage.setItem('events', JSON.stringify(events.filter(event => event.id !== item.id)));
    }
    alert(`${item.title} has been deleted.`);
  };

  const editItemHandler = (item, type) => {
    setEditItem(item);
    setUploadType(type);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      // Send email to admin
      await emailjs.send(
        'service_gijhqwn',
        'template_61rqh84',
        {
          to_email: 'hyelnamuninathan@gmail.com',
          message: `New subscriber: ${email}`,
        },
        'j5gTxmOKyrxCeCdyP'
      );

      // Send welcome email to user
      await emailjs.send(
        'service_gijhqwn',
        'template_9exub1v',
        {
          to_email: email,
          message: 'Welcome to DJ Dave\'s newsletter!',
        },
        'j5gTxmOKyrxCeCdyP'
      );

      alert('Thank you for subscribing! Welcome to DJ Dave\'s world of music!');
      setIsSubscribeModalOpen(false);
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('There was an error subscribing. Please try again later.');
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_CONTACT_TEMPLATE_ID',
        {
          from_name: formData.get('name'),
          from_email: formData.get('email'),
          message: formData.get('message'),
        },
        'YOUR_USER_ID'
      );
      alert('Your message has been sent successfully!');
      e.target.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('There was an error sending your message. Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 animate-pulse">DJ DAVE</h1>
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-4 h-4 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Header and Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-gray-800 text-white z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">DJ Dave</div>
          <div className="flex items-center space-x-4">
            <ul className="hidden md:flex space-x-4">
              {['home', 'about', 'music', 'events', 'contact'].map((section) => (
                <li key={section}>
                  <button
                    className={`hover:text-gray-300 transition-colors ${activeSection === section ? 'text-yellow-400 font-bold' : ''}`}
                    onClick={() => scrollToSection(section)}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <div className="md:hidden">
              <button onClick={toggleMenu}>
                <span className="sr-only">Toggle menu</span>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 p-4">
            <ul className="space-y-2">
              {['home', 'about', 'music', 'events', 'contact'].map((section) => (
                <li key={section}>
                  <button
                    className={`w-full text-left hover:text-gray-300 transition-colors ${activeSection === section ? 'text-yellow-400 font-bold' : ''}`}
                    onClick={() => {
                      scrollToSection(section);
                      setIsMenuOpen(false);
                    }}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <main className="pt-16">
        {/* Home Section */}
        <section id="home" className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{backgroundImage:  `url(${Atclub})`}}>
          <div className="text-center text-white bg-black bg-opacity-50 p-8 rounded-lg">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">Welcome to DJ Dave's World</h1>
            <p className="text-xl mb-8 animate-fade-in-up animation-delay-200">Experience the beats that move your soul</p>
            <form onSubmit={handleSearch} className="flex justify-center animate-fade-in-up animation-delay-400">
              <input
                type="text"
                placeholder="Search for tracks or events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-xs mr-2 px-4 py-2 rounded-md text-black"
              />
              <button type="submit" className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors">
                Search
              </button>
            </form>
            {searchResults.length > 0 && (
              <div className="mt-4 bg-white text-gray-800 p-4 rounded-md">
                <h3 className="font-bold mb-2">Search Results:</h3>
                <ul>
                  {searchResults.map((item) => (
                    <li key={item.id} className="mb-2 hover:bg-gray-100 p-2 rounded transition-colors">
                      {item.artist ? (
                        <button onClick={() => playSong(item)}>
                          {item.title} by {item.artist}
                        </button>
                      ) : (
                        <button onClick={() => scrollToSection('events')}>
                          {item.title} - {item.date}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-gray-100 dark:bg-gray-800 dark:text-white">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src={DJ}
                alt="DJ Dave"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h2 className="text-3xl font-bold mb-4">About DJ Dave</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                DJ Dave is a passionate music producer with over a decade of experience in creating electrifying beats and unforgettable mixes. From underground clubs to major festivals, Dave has left his mark on the electronic music scene.
              </p>
            </div>
          </div>
        </section>

        {/* Music Section */}
        <section id="music" className="py-16 bg-gray-200 dark:bg-gray-700 dark:text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Music</h2>
            <div className="flex justify-center mb-4">
              <button
                className={`px-4 py-2 rounded-l-md ${uploadType === 'song' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-300 text-gray-800'}`}
                onClick={() => setUploadType('song')}
              >
                All Songs
              </button>
              <button
                className={`px-4 py-2 rounded-r-md ${uploadType === 'event' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-300 text-gray-800'}`}
                onClick={() => setUploadType('event')}
              >
                Playlist
              </button>
            </div>
            {uploadType === 'song' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {songs.map((song) => (
                  <div key={song.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <img
                      src={song.coverImage}
                      alt={song.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold mb-2">{song.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{song.artist}</p>
                      <div className="flex justify-between items-center">
                        <button
                          className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors flex items-center"
                          onClick={() => playSong(song)}
                        >
                          {currentSong?.id === song.id && isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {currentSong?.id === song.id && isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <div className="flex space-x-2">
                          <button
                            className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            onClick={() => addToPlaylist(song)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            onClick={() => shareSong(song)}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                {playlist.length === 0 ? (
                  <p className="text-center text-gray-600 dark:text-gray-300">Your playlist is empty. Add songs to get started!</p>
                ) : (
                  playlist.map((song) => (
                    <div key={song.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center">
                        <img
                          src={song.coverImage}
                          alt={song.title}
                          className="w-12 h-12 rounded-md mr-4"
                        />
                        <div>
                          <h4 className="font-semibold">{song.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{song.artist}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="bg-yellow-400 text-gray-800 p-2 rounded-full hover:bg-yellow-300 transition-colors"
                          onClick={() => playSong(song)}
                        >
                          {currentSong?.id === song.id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          onClick={() => removeFromPlaylist(song.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="py-16 bg-gray-100 dark:bg-gray-800 dark:text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((event) => (
                <div key={event.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">Date: {event.date}</p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Location: {event.location}</p>
                    <button
                      className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors"
                      onClick={() => window.open(`https://wa.me/9030107976?text=Hello, I'd like to request tickets for the event: ${event.title}`)}
                    >
                      Get Tickets
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-gray-200 dark:bg-gray-700 dark:text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Get in Touch</h2>
            <form onSubmit={handleContact} className="max-w-md mx-auto">
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  required
                />
              </div>
              <div className="mb-4">
                <textarea
                  name="message"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  rows={4}
                  placeholder="Your Message"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p>&copy; 2023 DJ Dave. All rights reserved.</p>
          <button
            className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Admin Panel
          </button>
        </div>
      </footer>

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <form onSubmit={handlePasswordSubmit} className="mb-4">
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 mb-2"
                required
              />
              <button
                type="submit"
                className="w-full bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors"
              >
                Submit
              </button>
            </form>
            {adminPassword === 'admindave' && (
              <div>
                <div className="flex justify-center mb-4">
                  <button
                    className={`px-4 py-2 ${uploadType === 'song' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setUploadType('song')}
                  >
                    Upload
                  </button>
                  <button
                    className={`px-4 py-2 ${uploadType === 'manage' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setUploadType('manage')}
                  >
                    Manage
                  </button>
                </div>
                {uploadType === 'song' ? (
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                      <label className="block mb-2">Upload Type</label>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-md ${uploadType === 'song' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200 text-gray-800'}`}
                          onClick={() => setUploadType('song')}
                        >
                          Song
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-md ${uploadType === 'event' ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200 text-gray-800'}`}
                          onClick={() => setUploadType('event')}
                        >
                          Event
                        </button>
                      </div>
                    </div>
                    {uploadType === 'song' ? (
                      <>
                        <input
                          type="text"
                          name="title"
                          placeholder="Song Title"
                          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          required
                        />
                        <input
                          type="text"
                          name="artist"
                          placeholder="Artist"
                          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          required
                        />
                        <input
                          type="file"
                          name="audioFile"
                          accept="audio/*"
                          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          required
                        />
                        <input
                          type="file"
                          name="coverImage"
                          accept="image/*"
                          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          required
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          name="title"
                          placeholder="Event Title"
                          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          required
                        />
                        <input
                          type="date"
                          name="date"
                          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          required
                        />
                        <input
                          type="text"
                          name="location"
                          placeholder="Location"
                          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          required
                        />
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          required
                        />
                      </>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors"
                    >
                      Upload
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Manage Songs</h3>
                    {songs.map((song) => (
                      <div key={song.id} className="flex items-center justify-between">
                        <span>{song.title}</span>
                        <div>
                          <button
                            onClick={() => editItemHandler(song, 'song')}
                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(song, 'song')}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    <h3 className="font-bold text-lg mt-6">Manage Events</h3>
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <span>{event.title}</span>
                        <div>
                          <button
                            onClick={() => editItemHandler(event, 'event')}
                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(event, 'event')}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              className="mt-4 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={currentSong.coverImage}
                alt={currentSong.title}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h4 className="font-semibold">{currentSong.title}</h4>
                <p className="text-sm">{currentSong.artist}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={playPrevious}><SkipBack className="w-6 h-6" /></button>
              <button onClick={togglePlayPause}>
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button onClick={playNext}><SkipForward className="w-6 h-6" /></button>
              <button onClick={() => setCurrentSong(null)}><X className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} onEnded={playNext} />

      <a
        href="https://wa.me/9030107976?text=Hello%20I%20want%20to%20know%20more%20about%20your%20events"
        className="fixed bottom-20 right-4 bg-green-500 text-white rounded-full p-3 shadow-lg md:hidden"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Mail className="w-6 h-6" />
      </a>

      {isSubscribeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-2xl w-full flex">
            <div className="w-1/2 pr-4">
            <img src={`${lonk}?height=300&width=300`} alt="DJ Dave" className="w-full h-auto rounded-lg"/>
            </div>
            <div className="w-1/2 pl-4">
              <h2 className="text-2xl font-bold mb-4">Subscribe to DJ Dave's Newsletter</h2>
              <p className="mb-4">Stay updated with the latest tracks, events, and exclusive content!</p>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <button
                className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                onClick={() => setIsSubscribeModalOpen(false)}
              >
                No thanks, maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}