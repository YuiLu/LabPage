const { sql } = require('@vercel/postgres');

function getPostgresDebugInfo() {
  const rawUrl = process.env.POSTGRES_URL;
  if (!rawUrl) return { postgresUrlPresent: false };

  try {
    const parsed = new URL(rawUrl);
    return {
      postgresUrlPresent: true,
      postgresUrlScheme: parsed.protocol.replace(':', ''),
      postgresUrlHost: parsed.host
    };
  } catch {
    return { postgresUrlPresent: true, postgresUrlScheme: 'unparseable' };
  }
}

// Seed data - all existing team members
const seedData = {
  "members": [
    {
      "name": "Mengtian Li",
      "name_cn": "李梦甜",
      "role": "Assistant Professor & Director",
      "category": "faculty",
      "photo_url": "images/team/MengtianLi.jpg",
      "social_links": [
        {"platform": "personal", "url": "https://mengtianli.github.io/", "icon": "images/social/Personal.png"},
        {"platform": "xiaohongshu", "url": "https://www.xiaohongshu.com/user/profile/58af17f65e87e775fa546d64", "icon": "images/social/xiaohongshu.png"}
      ],
      "display_order": 1,
      "is_approved": true
    },
    {
      "name": "Zhifeng Xie",
      "name_cn": "谢志峰",
      "role": "Associate Professor",
      "category": "faculty",
      "photo_url": "images/team/ZhifengXie.jpg",
      "social_links": [],
      "display_order": 2,
      "is_approved": true
    },
    {
      "name": "Fan Yang",
      "name_cn": "杨凡",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/FanYang.jpg",
      "social_links": [],
      "display_order": 10,
      "is_approved": true
    },
    {
      "name": "Yunshu Bai",
      "name_cn": "白云舒",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/YunshuBai.jpg",
      "social_links": [],
      "display_order": 11,
      "is_approved": true
    },
    {
      "name": "Kunyan Dai",
      "name_cn": "戴坤延",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/KunyanDai.jpg",
      "social_links": [],
      "display_order": 12,
      "is_approved": true
    },
    {
      "name": "Yuwei Lu",
      "name_cn": "陆毓炜",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/YuweiLu.jpg",
      "social_links": [
        {"platform": "bilibili", "url": "https://space.bilibili.com/23208863?spm_id_from=333.1007.0.0", "icon": "images/social/bilibili.png"},
        {"platform": "personal", "url": "https://www.yuilu.space/", "icon": "images/social/Personal.png"},
        {"platform": "zhihu", "url": "https://www.zhihu.com/people/zhang-jia-hui-55-74", "icon": "images/social/zhihu.png"}
      ],
      "display_order": 13,
      "is_approved": true
    },
    {
      "name": "Sifan Xiong",
      "name_cn": "熊思帆",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/SifanXiong.jpg",
      "social_links": [],
      "display_order": 14,
      "is_approved": true
    },
    {
      "name": "Xinru Guo",
      "name_cn": "郭心如",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/XinruGuo.jpg",
      "social_links": [],
      "display_order": 15,
      "is_approved": true
    },
    {
      "name": "Ruixue Xiong",
      "name_cn": "熊瑞雪",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/RuixueXiong.jpg",
      "social_links": [],
      "display_order": 16,
      "is_approved": true
    },
    {
      "name": "Jiayi Zeng",
      "name_cn": "曾佳祎",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/JiayiZeng.jpg",
      "social_links": [],
      "display_order": 17,
      "is_approved": true
    },
    {
      "name": "Yukun Zhang",
      "name_cn": "张鈺坤",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/YukunZhang.jpg",
      "social_links": [],
      "display_order": 18,
      "is_approved": true
    },
    {
      "name": "Lin Yang",
      "name_cn": "杨琳",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/LinYang.jpg",
      "social_links": [],
      "display_order": 19,
      "is_approved": true
    },
    {
      "name": "Chenqi Gan",
      "name_cn": "干晨祺",
      "role": "Master Student",
      "category": "postgraduate",
      "photo_url": "images/team/Postgraduate/ChenqiGan.jpg",
      "social_links": [],
      "display_order": 20,
      "is_approved": true
    },
    {
      "name": "Feifei Li",
      "name_cn": "李菲菲",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/FeifeiLi.jpg",
      "social_links": [],
      "display_order": 30,
      "is_approved": true
    },
    {
      "name": "Botao Qing",
      "name_cn": "秦博涛",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/BotaoQing.jpg",
      "social_links": [],
      "display_order": 31,
      "is_approved": true
    },
    {
      "name": "Yichen Pan",
      "name_cn": "潘奕宸",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/YichenPan.jpg",
      "social_links": [],
      "display_order": 32,
      "is_approved": true
    },
    {
      "name": "Yi Ding",
      "name_cn": "丁乙",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/YiDing.jpg",
      "social_links": [],
      "display_order": 33,
      "is_approved": true
    },
    {
      "name": "Yiming Chu",
      "name_cn": "褚依敏",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/YimingChu.jpg",
      "social_links": [],
      "display_order": 34,
      "is_approved": true
    },
    {
      "name": "Xiaoru Lin",
      "name_cn": "林小茹",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/XiaoruLin.jpg",
      "social_links": [],
      "display_order": 35,
      "is_approved": true
    },
    {
      "name": "Yuxin Ding",
      "name_cn": "丁雨欣",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/YuxinDing.jpg",
      "social_links": [],
      "display_order": 36,
      "is_approved": true
    },
    {
      "name": "Yuanyuan Song",
      "name_cn": "宋园园",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/YuanyuanSong.jpg",
      "social_links": [],
      "display_order": 37,
      "is_approved": true
    },
    {
      "name": "Ling Wang",
      "name_cn": "王玲",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/LingWang.jpg",
      "social_links": [],
      "display_order": 38,
      "is_approved": true
    },
    {
      "name": "Yijun Shen",
      "name_cn": "沈怡均",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/YijunShen.jpg",
      "social_links": [],
      "display_order": 39,
      "is_approved": true
    },
    {
      "name": "Ruobing Ni",
      "name_cn": "倪若冰",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/RuobingNi.jpg",
      "social_links": [],
      "display_order": 40,
      "is_approved": true
    },
    {
      "name": "Hongzhi Liu",
      "name_cn": "刘泓志",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/HongzhiLiu.jpg",
      "social_links": [],
      "display_order": 41,
      "is_approved": true
    },
    {
      "name": "Zicheng Zhao",
      "name_cn": "赵梓成",
      "role": "Undergraduate Internship",
      "category": "undergraduate",
      "photo_url": "images/team/Undergraduate/ZichengZhao.jpg",
      "social_links": [],
      "display_order": 42,
      "is_approved": true
    },
    {
      "name": "Yi Shi",
      "name_cn": "石义",
      "role": "Research Assistant",
      "category": "ra",
      "photo_url": "images/team/RA/YiShi.jpg",
      "social_links": [],
      "display_order": 50,
      "is_approved": true
    },
    {
      "name": "Yang Ge Ri Le",
      "name_cn": "杨格日勒",
      "role": "Research Assistant",
      "category": "ra",
      "photo_url": "images/team/RA/Yanggerile.jpg",
      "social_links": [],
      "display_order": 51,
      "is_approved": true
    },
    {
      "name": "Chengshuo Zhai",
      "name_cn": "翟承硕",
      "role": "Master Student (Graduated)",
      "category": "alumni",
      "photo_url": "images/team/Postgraduate/ChengshuoZhai.jpg",
      "social_links": [],
      "display_order": 100,
      "is_approved": true
    },
    {
      "name": "Shengxiang Yao",
      "name_cn": "姚声祥",
      "role": "Master Student (Graduated)",
      "category": "alumni",
      "photo_url": "images/team/Postgraduate/ShengxiangYao.jpg",
      "social_links": [],
      "display_order": 101,
      "is_approved": true
    }
  ]
};

// CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.POSTGRES_URL) {
    return res.status(500).json({
      success: false,
      error: 'Database is not configured for this deployment (missing POSTGRES_URL). Please ensure Vercel Postgres is connected and its environment variables are available in the Production environment, then redeploy.'
    });
  }

  try {
    let insertedCount = 0;
    
    for (const member of seedData.members) {
      const socialLinksJson = JSON.stringify(member.social_links || []);
      
      // Check if member already exists (by name and category)
      const existing = await sql`
        SELECT id FROM team_members 
        WHERE name = ${member.name} AND category = ${member.category}
      `;
      
      if (existing.rows.length === 0) {
        await sql`
          INSERT INTO team_members (name, name_cn, role, category, photo_url, website, social_links, display_order, is_approved)
          VALUES (
            ${member.name}, 
            ${member.name_cn || null}, 
            ${member.role}, 
            ${member.category}, 
            ${member.photo_url || null}, 
            ${member.website || null}, 
            ${socialLinksJson}::jsonb, 
            ${member.display_order || 0},
            ${member.is_approved !== false}
          )
        `;
        insertedCount++;
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Seed completed. Inserted ${insertedCount} new members.`,
      total: seedData.members.length
    });

  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to seed database: ' + error.message,
      debug: getPostgresDebugInfo()
    });
  }
};
