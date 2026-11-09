<?php

/*
| Every word a public visitor sees, in Bahasa Melayu. The same keys as
| lang/en/site.php. See that file for how the keys are used.
|
| The Privacy Policy and Terms & Conditions here are a draft translation and
| need review by a fluent person before they are relied on.
*/

return [
    'toast' => [
        'consent_save_failed' => 'Kami tidak dapat menyimpan pilihan kuki anda. Sila cuba lagi.',
        'consent_saved' => 'Terima kasih. Pilihan kuki anda telah disimpan.',
        'consent_declined' => 'Baiklah. Kami akan bertanya lagi esok.',
        'contact_sent' => 'Terima kasih. Mesej anda telah sampai ke bilik berita.',
    ],

    'common' => [
        'site' => [
            'edition' => 'Edisi Kuala Lumpur',
            'tagline' => 'Kewartawanan bebas untuk Malaysia',
            'menu_description' => 'Berita dan gaya hidup dari Kuala Lumpur.',
            'skip_to_content' => 'Langkau ke kandungan',
            'logo_home' => ', laman utama',
            'main_nav' => 'Utama',
            'mobile_nav' => 'Mudah alih',
            'footer_nav' => 'Pengaki',
            'open_menu' => 'Buka menu',
            'close' => 'Tutup',
            'theme_to_light' => 'Tukar ke mod cerah',
            'theme_to_dark' => 'Tukar ke mod gelap',
            'back_to_top' => 'Kembali ke atas',
        ],
        'language' => [
            'label' => 'Bahasa',
            'en' => 'English',
            'ms' => 'Bahasa Melayu',
        ],
        'nav' => [
            'home' => 'Utama',
            'about' => 'Perihal & Hubungi',
            'privacy' => 'Privasi',
            'terms' => 'Terma',
        ],
        'footer' => [
            'about' => 'Kewartawanan berita dan gaya hidup yang bebas dari Kuala Lumpur, untuk semua yang menganggap Malaysia sebagai tanah air.',
            'pages' => 'Halaman',
            'your_data' => 'Data anda',
            'privacy_policy' => 'Dasar Privasi',
            'terms' => 'Terma & Syarat',
            'cookie_settings' => 'Tetapan kuki',
            'newsroom' => 'Bilik berita',
            'address' => ['Aras 18, Menara Meridian', '182 Jalan Ampang', '50450 Kuala Lumpur'],
            'rights' => '© :year Meridian Media Sdn. Bhd. Hak cipta terpelihara.',
            'send_tip' => 'Hantar maklumat',
            'staff_sign_in' => 'Log masuk kakitangan',
        ],
        'consent' => [
            'kicker' => 'Privasi anda',
            'title' => 'Persetujuan kuki',
            'intro' => 'Kuki diperlukan supaya laman web ini berfungsi dengan baik, untuk pengukuran prestasi dan untuk memberikan anda pengalaman terbaik.',
            'agreement' => 'Dengan terus mengakses atau menggunakan laman ini, anda mengakui dan bersetuju dengan penggunaan kuki kami menurut <terms>Terma & Syarat</terms> dan <privacy>Penyata Privasi</privacy> kami.',
            'status_accepted' => 'Anda telah <strong>menerima</strong> pada :date. Pilih sekali lagi untuk mengubahnya.',
            'status_declined' => 'Anda telah <strong>menolak</strong> pada :date. Pilih sekali lagi untuk mengubahnya.',
            'back' => 'Kembali ke notis',
            'decline' => 'Tolak',
            'accept' => 'Terima',
        ],
        'story' => [
            'desk_suffix' => ' (meja berita)',
            'min_read' => ':minutes minit bacaan',
            'min_left' => ':minutes minit lagi',
            'resume' => ':minutes minit lagi, sambung dari tempat anda berhenti',
            'read' => 'Sudah dibaca',
            'finished' => 'Selesai',
            'edition' => 'Edisi minggu ini',
            'sample_notice' => 'Cerita contoh. Orang dan perniagaan di dalamnya adalah rekaan.',
            'sections_nav' => 'Bahagian cerita ini',
            'drag_to_scroll' => 'Seret untuk menatal cerita',
            'reading_position' => 'Kedudukan bacaan',
            'end' => 'Anda telah sampai ke penghujung.',
            'end_quick' => 'Cepatnya. :time untuk cerita ini.',
            'end_promised' => 'Selesai. :time untuk cerita ini, lebih kurang seperti yang kami janjikan.',
            'seconds' => ':seconds saat',
            'minutes_seconds' => ':minutes minit :seconds saat',
            'next_in_edition' => 'Seterusnya dalam edisi minggu ini',
            'back_to_edition' => 'Kembali ke edisi minggu ini',
        ],
        'legal' => [
            'last_updated' => 'Kemas kini terakhir',
            'contents' => 'Kandungan',
        ],
    ],

    'home' => [
        'title' => 'Berita dan gaya hidup Malaysia, disampaikan dengan teliti',
        'description' => 'Meridian ialah penerbit digital Malaysia yang bebas, membawakan berita, perniagaan, gaya hidup, makanan, budaya dan sukan dari Kuala Lumpur.',
        'hero' => [
            'kicker' => 'Bebas · Kuala Lumpur · Sejak 2014',
            'title' => 'Cerita yang membentuk Malaysia, <em>disampaikan dengan teliti.</em>',
            'body' => 'Meridian ialah penerbit berita dan gaya hidup digital untuk pembaca yang mahu memahami negara ini, bukan sekadar menatalnya. Setiap pagi, bilik berita kami memisahkan yang penting daripada yang sekadar bising, lalu menerangkannya dengan jelas.',
            'meet' => 'Kenali bilik berita',
            'standards' => 'Piawaian editorial kami',
        ],
        'edition' => [
            'title' => 'Edisi minggu ini',
            'selected' => 'Pilihan editor',
        ],
        'desks' => [
            'kicker' => 'Liputan kami',
            'title' => 'Enam meja berita, satu janji: konteks sebelum kebisingan.',
            'description' => 'Wartawan kami pakar dalam bidang masing-masing. Mereka kekal dalam satu bidang bertahun-tahun, membina sumber di seluruh negara dan tahu angka mana yang boleh dipercayai.',
            'items' => [
                ['name' => 'Negara', 'body' => 'Parlimen, dasar dan keputusan yang sampai ke rumah anda, dari Putrajaya hingga ke dewan undangan negeri.', 'rhythm' => 'Setiap hari'],
                ['name' => 'Perniagaan', 'body' => 'Pasaran, syarikat pemula dan kos sara hidup, diterangkan oleh wartawan yang membaca laporan kewangan supaya anda tidak perlu.', 'rhythm' => 'Setiap hari'],
                ['name' => 'Gaya hidup', 'body' => 'Rumah, kesihatan, kerja dan keluarga, ditulis mengikut cara rakyat Malaysia benar-benar hidup hari ini.', 'rhythm' => 'Hari bekerja'],
                ['name' => 'Makanan', 'body' => 'Legenda penjaja, kedai baharu dan resipi dari setiap pelosok semenanjung, Sabah dan Sarawak.', 'rhythm' => 'Tiga kali seminggu'],
                ['name' => 'Budaya', 'body' => 'Filem, muzik, buku dan karyawan yang membentuk jati diri Malaysia yang yakin, di dalam dan di luar negara.', 'rhythm' => 'Setiap minggu'],
                ['name' => 'Sukan', 'body' => 'Dari badminton dan bola sepak hingga liga akar umbi, dengan analisis yang melangkaui keputusan perlawanan.', 'rhythm' => 'Setiap hari'],
            ],
        ],
        'long_read' => [
            'kicker' => 'Bacaan panjang hari Ahad',
            'quote' => '“Dulu kami naik motor dua jam ke bank di pekan. Sekarang emak saya jual sambal tuhau kepada pembeli di Johor dari dapurnya.”',
            'quote_source' => 'Rosnah, pekebun kecil di Kota Marudu',
            'body' => 'Selama enam bulan, biro Malaysia Timur kami mengikuti tiga buah kampung ketika jalur lebar gentian, e-dompet dan rangkaian penghantaran kendalian komuniti tiba. Hasilnya ialah potret perubahan yang lebih pantas, lebih berselerak dan lebih penuh harapan daripada yang digambarkan oleh statistik negara.',
        ],
        'figures' => [
            'title' => 'Meridian dalam angka',
            'items' => [
                ['value' => 2400000, 'label' => 'pembaca setiap bulan'],
                ['value' => 38, 'label' => 'wartawan dan editor'],
                ['value' => 2, 'label' => 'bahasa, Inggeris dan Bahasa Malaysia'],
                ['value' => 16, 'label' => 'negeri dan wilayah persekutuan diliputi'],
            ],
        ],
        'principles' => [
            'kicker' => 'Cara kami bekerja',
            'title' => 'Kepercayaan diraih satu cerita demi satu cerita.',
            'items' => [
                ['title' => 'Disahkan sebelum diterbitkan', 'body' => 'Setiap cerita disemak oleh editor kedua. Jika kami tidak dapat mengesahkannya, kami tidak menyiarkannya, sepantas mana pun internet bergerak.'],
                ['title' => 'Diterangkan, bukan dilaungkan', 'body' => 'Tajuk kami memberitahu apa yang berlaku, dan cerita kami memberitahu mengapa ia penting. Tiada umpan kemarahan, tiada umpan klik.'],
                ['title' => 'Diperbetulkan secara terbuka', 'body' => 'Apabila kami tersilap, kami membetulkannya dalam masa 24 jam dan menyatakannya di bahagian atas cerita, berserta tarikh perubahan.'],
            ],
        ],
        'tip' => [
            'title' => 'Ada cerita yang patut didengar oleh Malaysia?',
            'body' => 'Laporan terbaik kami sering bermula daripada seorang pembaca. Beritahu kami apa yang anda lihat, dan seorang anggota bilik berita akan membaca setiap patah perkataan.',
            'cta' => 'Hubungi bilik berita',
        ],
    ],

    'about' => [
        'title' => 'Perihal Kami & Hubungi',
        'description' => 'Kenali bilik berita Meridian di Kuala Lumpur: kisah kami, piawaian editorial kami, pasukan kami dan cara menghubungi kami.',
        'hero' => [
            'kicker' => 'Perihal Meridian',
            'title' => 'Bilik berita yang dibina untuk jangka panjang.',
            'paragraphs' => [
                'Meridian bermula pada 2014 dengan tiga wartawan, satu pencetak pinjaman dan keyakinan bahawa rakyat Malaysia layak mendapat kewartawanan yang menghormati masa dan kebijaksanaan mereka.',
                'Dua belas tahun kemudian, kami pasukan seramai 38 orang di Kuala Lumpur, Pulau Pinang dan Kota Kinabalu. Kami dibiayai oleh pembaca dan pengiklanan yang bertanggungjawab, dan kami hanya bertanggungjawab kepada mereka yang membaca kami.',
            ],
        ],
        'story' => [
            'kicker' => 'Kisah kami',
            'title' => 'Dua belas tahun, satu peraturan.',
            'timeline' => [
                ['year' => '2014', 'text' => 'Tiga wartawan membuka Meridian di sebuah rumah kedai sewa di Bangsar dengan satu peraturan: tiada cerita keluar tanpa disemak.'],
                ['year' => '2017', 'text' => 'Edisi Bahasa Malaysia dilancarkan, ditulis oleh pasukannya sendiri dan bukan diterjemahkan.'],
                ['year' => '2020', 'text' => 'Surat berita Meridian Briefing bermula. Lima cerita, tujuh minit, setiap hari bekerja pada pukul 7 pagi.'],
                ['year' => '2023', 'text' => 'Gaya Hidup dan Makanan menjadi meja berita penuh, dan bilik berita berpindah ke Jalan Ampang.'],
                ['year' => '2026', 'text' => 'Biro Malaysia Timur dibuka di Kota Kinabalu, supaya Sabah dan Sarawak dilaporkan dari Sabah dan Sarawak.'],
            ],
        ],
        'facts' => [
            'title' => 'Bilik berita sepintas lalu',
            'items' => [
                ['term' => 'Diasaskan', 'detail' => '2014, Kuala Lumpur'],
                ['term' => 'Bilik berita', 'detail' => '38 wartawan, editor dan penerbit'],
                ['term' => 'Biro', 'detail' => 'Kuala Lumpur, Pulau Pinang dan Kota Kinabalu'],
                ['term' => 'Bahasa', 'detail' => 'Inggeris dan Bahasa Malaysia'],
                ['term' => 'Pembaca', 'detail' => '2.4 juta sebulan'],
                ['term' => 'Penerbit', 'detail' => 'Meridian Media Sdn. Bhd.'],
            ],
        ],
        'standards' => [
            'kicker' => 'Piawaian editorial',
            'title' => 'Apa yang boleh anda tuntut daripada kami.',
            'description' => 'Inilah komitmen yang ditandatangani setiap wartawan Meridian. Jika anda rasa kami gagal memenuhinya, beritahu kami. Seorang editor kanan akan meneliti setiap aduan.',
            'items' => [
                ['title' => 'Ketepatan dahulu', 'body' => 'Dua editor membaca setiap cerita sebelum diterbitkan. Angka ada sumbernya, petikan dirakam dan dakwaan dikemukakan kepada pihak yang terbabit.'],
                ['title' => 'Kebebasan', 'body' => 'Tiada pemilik, pengiklan atau parti politik melihat sesuatu cerita sebelum anda. Kandungan tajaan sentiasa dilabel dan ditulis oleh pasukan berasingan.'],
                ['title' => 'Keadilan', 'body' => 'Kami memberi peluang sebenar untuk menjawab, kami mengelakkan bahasa sensasi, dan kami melaporkan tentang masyarakat dengan rasa hormat yang kami sendiri harapkan.'],
                ['title' => 'Ketelusan', 'body' => 'Pembetulan dibuat dalam masa 24 jam dan dinyatakan di bahagian atas cerita. Kod editorial kami diterbitkan dan terbuka untuk dipersoalkan.'],
            ],
        ],
        'team' => [
            'kicker' => 'Orang di sebaliknya',
            'title' => 'Siapa yang menerajui bilik berita.',
            'items' => [
                ['name' => 'Nadia Hassan', 'role' => 'Ketua pengarang', 'bio' => 'Bekas wartawan politik yang telah membuat liputan lima pilihan raya umum.'],
                ['name' => 'Kelvin Tan', 'role' => 'Editor urusan', 'bio' => 'Mengendalikan mesyuarat berita harian dan meja pembetulan.'],
                ['name' => 'Priya Raman', 'role' => 'Ketua Gaya Hidup & Makanan', 'bio' => 'Penulis makanan dan pengarang panduan sarapan Malaysia.'],
                ['name' => 'Joanna Gimbang', 'role' => 'Ketua biro, Malaysia Timur', 'bio' => 'Melaporkan tentang Sabah dan Sarawak dari Kota Kinabalu.'],
            ],
        ],
        'contact' => [
            'kicker' => 'Hubungi kami',
            'title' => 'Berbual dengan bilik berita.',
            'description' => 'Maklumat, pembetulan, kerjasama atau sekadar bertanya khabar. Pilih peti masuk yang sesuai, atau gunakan borang dan kami akan menyalurkannya untuk anda.',
            'visit' => 'Lawati',
            'address' => ['Aras 18, Menara Meridian', '182 Jalan Ampang, 50450 Kuala Lumpur'],
            'call' => 'Telefon',
            'write' => 'E-mel',
            'general' => 'Umum',
            'news_tips' => 'Maklumat berita',
            'corrections' => 'Pembetulan',
            'hours' => 'Waktu',
            'hours_lines' => ['Pejabat: Isnin hingga Jumaat, 9 pagi hingga 6 petang', 'Meja berita beroperasi setiap hari.'],
        ],
        'form' => [
            'title' => 'Hantar mesej kepada kami',
            'intro' => 'Semua ruangan wajib diisi. Butiran anda digunakan hanya untuk membalas.',
            'name' => 'Nama',
            'email' => 'E-mel',
            'topic' => 'Topik',
            'topics' => [
                ['value' => 'general', 'label' => 'Pertanyaan umum'],
                ['value' => 'news-tip', 'label' => 'Maklumat berita'],
                ['value' => 'correction', 'label' => 'Permintaan pembetulan'],
                ['value' => 'advertising', 'label' => 'Pengiklanan dan kerjasama'],
                ['value' => 'careers', 'label' => 'Kerjaya'],
            ],
            'message' => 'Mesej',
            'message_hint' => 'Sekurang-kurangnya 20 aksara.',
            'submit' => 'Hantar mesej',
        ],
    ],

    'privacy' => [
        'title' => 'Dasar Privasi',
        'description' => 'Cara Meridian menggunakan kuki dan mengendalikan data peribadi, termasuk apa sebenarnya yang disimpan oleh kuki persetujuan kami dan berapa lama ia kekal.',
        'kicker' => 'Penyata Privasi',
        'intro' => 'Jawapan yang jelas tentang data yang kami simpan, bermula dengan kuki. Kami menulisnya untuk dibaca, bukan untuk dilangkau.',
        'cookie_table' => [
            'label' => 'Kuki yang ditetapkan oleh laman web ini',
            'name' => 'Nama',
            'set' => 'Ditetapkan',
            'holds' => 'Kandungannya',
            'lasts' => 'Tempoh',
            'rows' => [
                ['cookie' => 'accepted', 'when' => 'Apabila anda memilih Terima', 'holds' => 'ID rawak (GUID), masa anda menerima (UTC) dan versi notis kuki yang anda lihat.', 'lasts' => '1 tahun'],
                ['cookie' => 'declined', 'when' => 'Apabila anda memilih Tolak', 'holds' => 'Masa anda menolak (UTC). Tiada yang lain.', 'lasts' => '1 hari'],
                ['cookie' => 'session', 'when' => 'Pada setiap lawatan', 'holds' => 'Rujukan sesi rawak yang memastikan laman berfungsi antara halaman.', 'lasts' => '2 jam selepas lawatan terakhir anda'],
                ['cookie' => 'XSRF-TOKEN', 'when' => 'Pada setiap lawatan', 'holds' => 'Token rawak yang melindungi borang kami daripada pemalsuan permintaan rentas laman.', 'lasts' => '2 jam selepas lawatan terakhir anda'],
                ['cookie' => 'appearance', 'when' => 'Pada lawatan pertama anda', 'holds' => 'Tetapan tema cerah, gelap atau sistem anda.', 'lasts' => '1 tahun'],
                ['cookie' => 'locale', 'when' => 'Apabila anda menukar bahasa', 'holds' => 'Bahasa yang anda pilih: en untuk English atau ms untuk Bahasa Melayu.', 'lasts' => '1 tahun'],
            ],
        ],
        'sections' => [
            ['id' => 'who-we-are', 'title' => 'Siapa kami', 'blocks' => [
                ['p' => 'Meridian diterbitkan oleh Meridian Media Sdn. Bhd., Aras 18, Menara Meridian, 182 Jalan Ampang, 50450 Kuala Lumpur (“Meridian”, “kami”). Kami menentukan bagaimana dan mengapa data peribadi anda diproses di laman web ini, dan ini menjadikan kami pengguna data di bawah undang-undang Malaysia.'],
                ['p' => 'Dasar ini menerangkan apa yang kami kumpulkan semasa anda melawat, sebabnya, berapa lama kami menyimpannya dan pilihan yang anda ada. Ia dibaca bersama <terms>Terma & Syarat</terms> kami.'],
            ]],
            ['id' => 'summary', 'title' => 'Ringkasannya', 'blocks' => [
                ['ul' => [
                    'Kami hanya menetapkan kuki yang disenaraikan dalam dasar ini. Kami tidak menggunakan kuki pengiklanan atau analitik pada masa ini.',
                    'Apabila anda menerima kuki, kami menyimpan ID rawak, masa dan versi notis, dalam kuki dan dalam pangkalan data kami. Dalam pangkalan data, kami juga menyimpan jenis peranti umum, keluarga pelayar, keluarga sistem pengendalian dan bahasa notis. Semua ini bukan nama, alamat e-mel atau alamat IP anda.',
                    'Apabila anda menolak, kami menyimpan masa tersebut dalam kuki yang kekal selama satu hari. Kami juga menambah satu baris pada kiraan penolakan, tanpa sebarang ID atau alamat IP.',
                    'Apa pun pilihan anda, pelayan kami menyimpan rekod sesi lawatan anda, dengan alamat IP dan butiran pelayar anda. Rekod ini berasingan daripada rekod persetujuan anda.',
                    'Anda boleh mengubah pilihan anda pada bila-bila masa. Jika anda menolak selepas menerima, kami menandakan rekod anda sebagai ditarik balik.',
                ]],
            ]],
            ['id' => 'cookies', 'title' => 'Kuki yang kami gunakan', 'blocks' => [
                ['p' => 'Kuki ialah fail teks kecil yang disimpan oleh laman web dalam pelayar anda. Inilah semua kuki yang ditetapkan oleh laman ini:'],
                ['cookie_table' => true],
                ['p' => 'Kuki sesi, <code>XSRF-TOKEN</code> dan <code>appearance</code> benar-benar diperlukan: laman ini tidak dapat berfungsi dengan selamat tanpanya. Kakitangan yang log masuk ke kawasan pentadbir kami juga menerima kuki yang mengingati susun atur bar sisi mereka.'],
                ['p' => 'Kuki <code>locale</code> hanya ditetapkan jika anda menggunakan suis bahasa, dan ia hanya mengingati pilihan itu. Tanpanya, laman ini dipaparkan dalam bahasa Inggeris.'],
                ['p' => 'Jika anda menerima kuki, pelayar anda juga mengingati sejauh mana anda telah membaca setiap cerita, supaya anda boleh menyambung dari tempat anda berhenti. Maklumat ini disimpan dalam storan tempatan pelayar anda di bawah <code>meridian.reading</code>. Ia tidak pernah dihantar kepada kami, dan ia dipadamkan jika anda menolak atau pilihan anda tamat tempoh.'],
            ]],
            ['id' => 'accepting', 'title' => 'Apabila anda menerima', 'blocks' => [
                ['p' => 'Memilih <strong>Terima</strong> menetapkan kuki <code>:accepted</code>. Ia menyimpan tiga nilai, ditulis sebagai teks biasa yang boleh anda baca dalam alat pembangun pelayar anda:'],
                ['ul' => [
                    '<strong>ID rawak (GUID)</strong>, seperti <code>3f2b8c1e-7a4d-4e9b-9c1a-5d6e7f8a9b0c</code>. Ia dijana secara rawak untuk anda dan tidak dikaitkan dengan nama, alamat e-mel atau alamat IP anda.',
                    '<strong>Masa anda menerima</strong>, dalam UTC.',
                    '<strong>Versi notis kuki</strong> yang anda persetujui.',
                ]],
                ['p' => 'Kuki ini kekal selama <strong>1 tahun</strong> dari saat anda menerima. Kami menyimpan tiga nilai yang sama dalam pangkalan data kami, supaya kami dapat menunjukkan bahawa persetujuan telah diberikan dan bilakah ia diberikan. Jika anda mengklik Terima sekali lagi semasa kuki anda masih sah, kami mengekalkan rekod sedia ada dan tidak mencipta rekod baharu.'],
                ['p' => 'Apabila anda mula-mula menerima, kami juga menentukan tiga butiran umum daripada pengepala yang dihantar oleh pelayar anda dan menyimpannya bersama rekod itu dalam pangkalan data kami, bukan dalam kuki:'],
                ['ul' => [
                    '<strong>Jenis peranti</strong>: Desktop, Mudah Alih, Tablet atau Tidak Diketahui.',
                    '<strong>Keluarga pelayar</strong>: Chrome, Safari, Firefox, Edge atau Lain-lain.',
                    '<strong>Keluarga sistem pengendalian</strong>: Windows, macOS, Android, iOS, Linux atau Lain-lain.',
                ]],
                ['p' => 'Kami menggunakan butiran ini untuk memahami jenis peranti yang memberikan persetujuan. Ia bersifat umum dan kadangkala salah: iPad boleh muncul sebagai desktop Mac. Kami tidak menyimpan alamat IP anda atau pengepala penuh pelayar bersama rekod ini.'],
                ['p' => 'Kami juga mencatat bahasa notis semasa anda menerima, sama ada English atau Bahasa Melayu, supaya kami dapat menunjukkan perkataan yang anda persetujui. Maklumat ini disimpan bersama rekod anda dalam pangkalan data kami, bukan dalam kuki.'],
            ]],
            ['id' => 'declining', 'title' => 'Apabila anda menolak', 'blocks' => [
                ['p' => 'Memilih <strong>Tolak</strong> menetapkan kuki <code>:declined</code>. Ia hanya menyimpan masa anda menolak, dalam UTC, dan kekal selama <strong>1 hari</strong>. Apabila ia tamat tempoh, kami akan bertanya lagi.'],
                ['p' => 'Jika anda belum menerima, kami juga menambah satu baris pada kiraan penolakan, yang hanya menyimpan masa dan versi notis. Baris itu tidak mengandungi ID, alamat IP atau butiran pelayar. Rekod sesi yang diterangkan di bawah “Data peribadi lain” disimpan apa pun pilihan anda.'],
            ]],
            ['id' => 'changing-your-mind', 'title' => 'Mengubah pilihan anda', 'blocks' => [
                ['p' => 'Anda boleh mengubah pilihan anda pada bila-bila masa melalui pautan <settings>Tetapan kuki</settings> di bahagian bawah setiap halaman. Memilih Tolak selepas menerima akan membuang kuki <code>:accepted</code>, dan memilih Terima akan membuang kuki <code>:declined</code>.'],
                ['p' => 'Apabila anda menolak selepas menerima, kami menandakan rekod anda dalam pangkalan data sebagai ditarik balik dan mencatat masanya, supaya ID rawak anda tidak lagi sah. Kami mengekalkan rekod yang ditarik balik itu, bersama butiran perantinya, sebagai bukti pilihan anda dan masanya. Jika anda menerima semula kemudian, anda akan mendapat ID rawak baharu dan rekod baharu.'],
                ['p' => 'Anda juga boleh memadamkan kuki melalui tetapan pelayar anda. Jika anda berbuat demikian, kami akan meminta pilihan anda sekali lagi pada lawatan seterusnya.'],
            ]],
            ['id' => 'notice-versions', 'title' => 'Apabila notis kami berubah', 'blocks' => [
                ['p' => 'Setiap versi notis kuki mempunyai nombor, dan pilihan anda terikat pada versi yang anda lihat. Jika kami mengubah cara kami menggunakan kuki dengan cara yang patut anda ketahui, contohnya dengan menambah pengukuran prestasi, kami akan menaikkan nombor versi dan bertanya kepada semua orang sekali lagi, walaupun kuki mereka belum tamat tempoh.'],
            ]],
            ['id' => 'other-data', 'title' => 'Data peribadi lain', 'blocks' => [
                ['p' => 'Jika anda menulis kepada kami melalui borang hubungan atau e-mel, kami menggunakan nama, alamat e-mel dan mesej anda hanya untuk membaca dan membalasnya.'],
                ['p' => 'Seperti semua laman web, pelayan kami menerima maklumat teknikal seperti alamat IP dan jenis pelayar anda apabila anda memuatkan halaman. Kami menggunakannya untuk menyampaikan laman ini dan memastikannya selamat. Jika anda menerima, kami juga menggunakan pengepala pelayar anda untuk menentukan butiran umum peranti yang diterangkan di bawah “Apabila anda menerima”.'],
                ['p' => 'Pelayan kami juga menyimpan rekod sesi dalam pangkalan data kami bagi setiap pelawat, sama ada anda menerima, menolak atau belum membuat pilihan. Rekod ini menyimpan alamat IP anda, pengepala penuh pelayar anda (ejen pengguna), masa terakhir anda aktif, dan data kerja seperti token keselamatan dan halaman terakhir yang anda buka.'],
                ['p' => 'Rekod sesi ini berasingan daripada rekod persetujuan anda. Ia tidak menyimpan ID rawak anda, dan rekod persetujuan anda tidak menyimpan alamat IP atau pengepala penuh pelayar anda. Sesi tamat 2 jam selepas lawatan terakhir anda. Kami membersihkan sesi yang telah tamat daripada pangkalan data dari semasa ke semasa, jadi sesuatu rekod mungkin kekal lebih lama daripada itu.'],
            ]],
            ['id' => 'pdpa', 'title' => 'Hak anda di bawah PDPA', 'blocks' => [
                ['p' => 'Kami mengendalikan data peribadi selaras dengan <strong>Akta Perlindungan Data Peribadi 2010</strong> (PDPA) Malaysia dan prinsip-prinsipnya: kami memberitahu anda apa yang kami kumpulkan dan sebabnya, menggunakannya hanya untuk tujuan itu, memastikannya selamat, tidak menyimpannya lebih lama daripada yang perlu, memastikannya tepat, dan membenarkan anda melihatnya.'],
                ['p' => 'Di bawah PDPA, anda boleh:'],
                ['ul' => [
                    'meminta akses kepada data peribadi anda yang kami simpan;',
                    'meminta kami membetulkan data yang tidak tepat atau sudah lapuk;',
                    'menarik balik persetujuan anda, yang boleh anda lakukan untuk kuki pada bila-bila masa;',
                    'meminta kami menghentikan pemprosesan yang mungkin menyebabkan kerosakan atau distres kepada anda.',
                ]],
                ['p' => 'Oleh sebab data di sebalik pilihan kuki anda tidak dikaitkan dengan identiti anda, kami mungkin memerlukan ID rawak daripada kuki <code>:accepted</code> untuk mencari rekod tertentu.'],
            ]],
            ['id' => 'sharing', 'title' => 'Perkongsian dan keselamatan', 'blocks' => [
                ['p' => 'Kami tidak menjual data peribadi. Kami hanya berkongsi data dengan penyedia perkhidmatan yang mengehos dan mengendalikan laman web ini untuk kami, di bawah kontrak yang mewajibkan mereka melindunginya, atau apabila undang-undang menghendakinya. Akses kepada pangkalan data kami terhad kepada kakitangan yang memerlukannya, dan semua trafik ke laman ini sepatutnya disulitkan semasa penghantaran.'],
            ]],
            ['id' => 'children', 'title' => 'Kanak-kanak', 'blocks' => [
                ['p' => 'Meridian ditulis untuk khalayak dewasa umum. Kami tidak dengan sengaja mengumpulkan data peribadi kanak-kanak di bawah umur 13 tahun. Jika anda percaya seorang kanak-kanak telah menghantar data peribadi kepada kami, hubungi kami dan kami akan memadamkannya.'],
            ]],
            ['id' => 'changes', 'title' => 'Perubahan pada dasar ini', 'blocks' => [
                ['p' => 'Kami menyemak dasar ini sekurang-kurangnya sekali setahun. Tarikh di bahagian atas menunjukkan bila ia terakhir diubah. Apabila sesuatu perubahan menjejaskan cara kami menggunakan kuki, kami juga akan meminta pilihan anda sekali lagi.'],
            ]],
            ['id' => 'contact', 'title' => 'Hubungi kami', 'blocks' => [
                ['p' => 'Untuk sebarang soalan tentang dasar ini atau data peribadi anda, tulis kepada Pegawai Perlindungan Data kami di <privacy_email>privacy@meridian.example</privacy_email> atau melalui pos ke alamat di atas. Anda juga boleh menghubungi bilik berita melalui <contact>halaman hubungan</contact> kami.'],
            ]],
        ],
    ],

    'terms' => [
        'title' => 'Terma & Syarat',
        'description' => 'Terma yang mengawal penggunaan laman web Meridian dan kandungannya oleh anda.',
        'kicker' => 'Perundangan',
        'intro' => 'Peraturan penggunaan Meridian, ditulis sejelas yang kami mampu. Sila baca bersama Dasar Privasi kami.',
        'sections' => [
            ['id' => 'agreement', 'title' => 'Persetujuan kepada terma ini', 'blocks' => [
                ['p' => 'Terma ini mengawal penggunaan laman web Meridian dan segala yang diterbitkan di dalamnya oleh anda. Dengan mengakses atau menggunakan laman ini, anda bersetuju dengan terma ini. Jika anda tidak bersetuju, sila jangan gunakan laman ini.'],
                ['p' => 'Laman ini dikendalikan oleh Meridian Media Sdn. Bhd., Aras 18, Menara Meridian, 182 Jalan Ampang, 50450 Kuala Lumpur (“Meridian”, “kami”).'],
            ]],
            ['id' => 'using-the-site', 'title' => 'Menggunakan laman ini', 'blocks' => [
                ['p' => 'Anda boleh membaca, berkongsi pautan dan mencetak artikel kami untuk kegunaan peribadi anda yang bukan komersial. Anda mestilah berumur sekurang-kurangnya 13 tahun untuk menggunakan laman ini, dan anda bertanggungjawab memastikan keselamatan mana-mana peranti yang anda gunakan untuk mengaksesnya.'],
            ]],
            ['id' => 'our-content', 'title' => 'Kandungan kami', 'blocks' => [
                ['p' => 'Semua artikel, gambar foto, ilustrasi, video, grafik serta nama dan logo Meridian dimiliki oleh Meridian atau pemberi lesen kami dan dilindungi oleh Akta Hak Cipta 1987 dan undang-undang lain.'],
                ['p' => 'Anda boleh memetik petikan pendek dengan kredit yang jelas dan pautan kepada cerita asal. Selain itu, termasuk menerbitkan semula artikel penuh, penyalinan sistematik atau penggunaan dalam produk komersial, memerlukan kebenaran bertulis kami. Untuk memohon, gunakan <contact>halaman hubungan</contact> kami.'],
            ]],
            ['id' => 'acceptable-use', 'title' => 'Penggunaan yang dibenarkan', 'blocks' => [
                ['p' => 'Semasa menggunakan laman ini, anda bersetuju untuk tidak:'],
                ['ul' => [
                    'melanggar mana-mana undang-undang, atau membantu orang lain melanggarnya;',
                    'mengikis, menuai atau memuat turun kandungan secara pukal, termasuk untuk melatih model pembelajaran mesin, tanpa kebenaran bertulis kami;',
                    'cuba mendapatkan akses tanpa kebenaran kepada laman ini, pelayan kami atau kawasan pentadbir kami, atau mengganggu fungsinya;',
                    'menghantar kepada kami apa-apa yang berunsur fitnah, kesat atau yang anda tiada hak untuk kongsikan.',
                ]],
            ]],
            ['id' => 'what-you-send', 'title' => 'Apa yang anda hantar kepada kami', 'blocks' => [
                ['p' => 'Apabila anda menghantar maklumat, komen atau mesej kepada kami, anda mengesahkan bahawa ia tepat setakat pengetahuan anda dan anda berhak berkongsinya. Kami mungkin menggunakan maklumat itu untuk melaporkan sesuatu cerita, tetapi kami tidak akan sekali-kali menamakan sumber sulit tanpa persetujuan mereka.'],
            ]],
            ['id' => 'accuracy', 'title' => 'Ketepatan dan pembetulan', 'blocks' => [
                ['p' => 'Kami berusaha keras untuk memastikan ketepatan dan membetulkan kesilapan dengan segera, seperti yang diterangkan dalam piawaian editorial kami. Kewartawanan kami diterbitkan sebagai maklumat am. Ia bukan nasihat kewangan, undang-undang, perubatan atau nasihat profesional lain, dan anda tidak patut bergantung padanya sebagai nasihat sedemikian.'],
            ]],
            ['id' => 'advertising', 'title' => 'Pengiklanan dan kandungan tajaan', 'blocks' => [
                ['p' => 'Laman ini mungkin memaparkan iklan dan kandungan tajaan. Kandungan tajaan sentiasa dilabel dengan jelas dan dihasilkan secara berasingan daripada bilik berita kami. Kemunculan di Meridian tidak bermakna kami mengendors pengiklan atau produknya.'],
            ]],
            ['id' => 'links', 'title' => 'Pautan ke laman web lain', 'blocks' => [
                ['p' => 'Cerita kami kadangkala memaut ke laman web lain. Kami tidak mengawal laman tersebut dan tidak bertanggungjawab atas kandungan, ketersediaan atau amalan privasinya.'],
            ]],
            ['id' => 'availability', 'title' => 'Ketersediaan', 'blocks' => [
                ['p' => 'Kami berusaha memastikan laman ini tersedia pada setiap masa tetapi tidak dapat menjanjikan bahawa ia bebas daripada gangguan atau ralat. Kami boleh mengubah, menggantung atau menarik balik mana-mana bahagiannya tanpa notis.'],
            ]],
            ['id' => 'liability', 'title' => 'Had liabiliti', 'blocks' => [
                ['p' => 'Setakat yang dibenarkan oleh undang-undang, Meridian tidak bertanggungan atas sebarang kerugian tidak langsung atau berbangkit yang timbul daripada penggunaan laman ini atau pergantungan pada kandungannya. Tiada apa-apa dalam terma ini mengehadkan liabiliti yang tidak boleh dihadkan di bawah undang-undang Malaysia, termasuk hak anda di bawah Akta Perlindungan Pengguna 1999.'],
            ]],
            ['id' => 'privacy-and-cookies', 'title' => 'Privasi dan kuki', 'blocks' => [
                ['p' => '<privacy>Dasar Privasi</privacy> kami menerangkan cara kami mengendalikan data peribadi dan kuki yang kami tetapkan dengan tepat. Apabila anda mula-mula melawat, kami meminta anda menerima atau menolak kuki, dan anda boleh mengubah pilihan itu pada bila-bila masa melalui pautan Tetapan kuki di bahagian bawah setiap halaman.'],
            ]],
            ['id' => 'changes', 'title' => 'Perubahan pada terma ini', 'blocks' => [
                ['p' => 'Kami mungkin mengemas kini terma ini dari semasa ke semasa. Tarikh di bahagian atas menunjukkan bila ia terakhir diubah. Jika anda terus menggunakan laman ini selepas sesuatu perubahan, anda menerima terma yang dikemas kini itu.'],
            ]],
            ['id' => 'governing-law', 'title' => 'Undang-undang yang mentadbir', 'blocks' => [
                ['p' => 'Terma ini ditadbir oleh undang-undang Malaysia. Sebarang pertikaian akan diputuskan oleh mahkamah di Kuala Lumpur.'],
            ]],
            ['id' => 'contact', 'title' => 'Hubungi kami', 'blocks' => [
                ['p' => 'Soalan tentang terma ini boleh dihantar ke <legal_email>legal@meridian.example</legal_email> atau melalui pos ke alamat di atas.'],
            ]],
        ],
    ],
];
