/**
 * Team Members Dynamic Loading Module
 * Loads team members from Vercel Postgres database and renders them
 */

(function() {
  'use strict';

  const API_BASE = '/api';
  
  // Platform icon mapping
  const platformIcons = {
    'personal': 'images/social/Personal.png',
    'github': 'images/social/github.png',
    'linkedin': 'images/social/linkedin.png',
    'twitter': 'images/social/twitter.png',
    'bilibili': 'images/social/bilibili.png',
    'zhihu': 'images/social/zhihu.png',
    'xiaohongshu': 'images/social/xiaohongshu.png'
  };

  // Category display order and titles
  const categoryConfig = {
    faculty: { title: 'Faculty', order: 1 },
    postgraduate: { title: 'Postgraduate Students', order: 2 },
    undergraduate: { title: 'Undergraduate Internship', order: 3 },
    ra: { title: 'Research Assistants', order: 4 },
    alumni: { title: 'Alumni', order: 5 }
  };

  /**
   * Fetch team members from the API
   */
  async function fetchMembers() {
    try {
      const response = await fetch(`${API_BASE}/members`);
      const data = await response.json();
      if (data.success) {
        return data.members;
      }
      throw new Error(data.error || 'Failed to fetch members');
    } catch (error) {
      console.error('Error fetching members:', error);
      return null;
    }
  }

  /**
   * Create social links HTML for a member
   */
  function createSocialLinksHTML(member) {
    let socialLinks = [];
    
    // Parse social_links if it's a string
    if (typeof member.social_links === 'string') {
      try {
        socialLinks = JSON.parse(member.social_links);
      } catch (e) {
        socialLinks = [];
      }
    } else if (Array.isArray(member.social_links)) {
      socialLinks = member.social_links;
    }

    // Add website as a social link if present
    if (member.website) {
      socialLinks.unshift({
        platform: 'personal',
        url: member.website,
        icon: platformIcons.personal
      });
    }

    if (socialLinks.length === 0) {
      // Default social icons
      return `
        <li class="list-inline-item"><a href="#"><i class="tf-ion-social-facebook"></i></a></li>
        <li class="list-inline-item"><a href="#"><i class="tf-ion-social-twitter"></i></a></li>
        <li class="list-inline-item"><a href="#"><i class="tf-ion-social-linkedin"></i></a></li>
        <li class="list-inline-item"><a href="#"><i class="tf-ion-social-dribbble-outline"></i></a></li>
      `;
    }

    return socialLinks.map(link => {
      const icon = link.icon || platformIcons[link.platform] || platformIcons.personal;
      return `
        <li class="list-inline-item">
          <a href="${link.url}" target="_blank" rel="noopener noreferrer">
            <img src="${icon}" alt="${link.platform}" class="social-img">
          </a>
        </li>
      `;
    }).join('');
  }

  /**
   * Create member card HTML
   */
  function createMemberCard(member, delay = 0) {
    const photoUrl = member.photo_url || 'images/team/default-avatar.png';
    const socialLinksHTML = createSocialLinksHTML(member);

    return `
      <div class="col-lg-3 col-md-6 wow fadeIn" data-wow-duration="500ms" data-wow-delay="${delay}ms">
        <div class="team-member">
          <div class="member-photo">
            <img class="img-fluid" src="${photoUrl}" alt="${member.name}" onerror="this.src='images/team/default-avatar.png'">
            <div class="mask">
              <ul class="list-inline">
                ${socialLinksHTML}
              </ul>
            </div>
          </div>
          <div class="member-meta">
            <h4 class="h5">${member.name_cn ? `<strong>${member.name}</strong>` : member.name}</h4>
            <span>${member.role}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create a section divider
   */
  function createDivider() {
    return `
      <div class="container mt-5 mb-5">
        <div class="row">
          <div class="col-lg-12">
            <div class="border"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Group members by category
   */
  function groupByCategory(members) {
    const groups = {};
    
    members.forEach(member => {
      const category = member.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(member);
    });

    // Sort groups by category order
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      const orderA = categoryConfig[a]?.order || 99;
      const orderB = categoryConfig[b]?.order || 99;
      return orderA - orderB;
    });

    return { groups, sortedCategories };
  }

  /**
   * Render team members to the container
   */
  function renderMembers(members, container) {
    if (!container) {
      console.error('People container not found');
      return;
    }

    const { groups, sortedCategories } = groupByCategory(members);
    
    let html = '';
    let isFirstGroup = true;

    sortedCategories.forEach(category => {
      const categoryMembers = groups[category];
      
      // Don't add divider before first group (faculty)
      if (!isFirstGroup && category !== 'alumni') {
        html += createDivider();
      }
      isFirstGroup = false;

      // Render members for this category
      categoryMembers.forEach((member, index) => {
        html += createMemberCard(member, index * 100);
      });
    });

    // Handle alumni section separately with its own title
    if (groups.alumni && groups.alumni.length > 0) {
      html += `
        </div>
      </div>
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="title text-center wow fadeInUp" data-wow-duration="500ms">
              <h2>Alumni</h2>
              <div class="border"></div>
            </div>
          </div>
      `;
      groups.alumni.forEach((member, index) => {
        html += createMemberCard(member, index * 100);
      });
    }

    container.innerHTML = html;

    // Reinitialize WOW.js for new elements
    if (typeof WOW !== 'undefined') {
      new WOW().init();
    }
  }

  /**
   * Initialize the team members section
   */
  async function initTeamMembers() {
    const container = document.getElementById('dynamic-team-container');
    if (!container) {
      // If no dynamic container, don't do anything (static page)
      return;
    }

    // Show loading state
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-3">Loading team members...</p>
      </div>
    `;

    const members = await fetchMembers();
    
    if (members && members.length > 0) {
      renderMembers(members, container);
    } else {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-muted">Unable to load team members. Please try again later.</p>
        </div>
      `;
    }
  }

  // Export for external use
  window.TeamMembers = {
    init: initTeamMembers,
    fetch: fetchMembers,
    render: renderMembers
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTeamMembers);
  } else {
    initTeamMembers();
  }

})();
