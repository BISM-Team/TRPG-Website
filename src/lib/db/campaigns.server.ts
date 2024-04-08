import { CampaignRole, type Campaign, type Campaign_User } from '@prisma/client';
import { db } from './db.server';
import { error } from '@sveltejs/kit';

export async function getCampaigns(user_id: string) {
  return (
    await db.campaign_User.findMany({
      where: {
        userId: user_id
      },
      select: {
        campaign: true
      }
    })
  ).map((user_campaign) => user_campaign.campaign);
}

export async function getCampaign(user_id: string, campaignId: string) {
  return await db.campaign.findUnique({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user_id
        }
      }
    },
    include: {
      Dashboard_Campaign: {
        where: {
          userId: user_id
        },
        include: {
          dashboard: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      Campaign_User: true,
      wikis: true
    }
  });
}

export async function getCampaignWithGmInfo(user_id: string, campaignId: string) {
  return await db.campaign.findUnique({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user_id
        }
      }
    },
    include: {
      Campaign_User: {
        where: {
          role: CampaignRole.gm
        }
      },
      Dashboard_Campaign: {
        where: {
          userId: user_id
        },
        include: {
          dashboard: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
}

export async function addPlayerToCampaign(
  user_id: string,
  campaign_id: string,
  user_to_add_id: string
) {
  return await db.campaign_User.create({
    data: {
      user: {
        connect: {
          id: user_to_add_id
        }
      },
      campaign: {
        connect: {
          id: campaign_id,
          Campaign_User: {
            some: {
              userId: user_id,
              role: CampaignRole.gm
            }
          }
        }
      },
      role: CampaignRole.member
    }
  });
}

export async function removePlayerFromCampaign(
  user_id: string,
  campaign_id: string,
  user_to_remove_id: string
) {
  return await db.campaign_User.delete({
    where: {
      userId_campaignId: {
        userId: user_to_remove_id,
        campaignId: campaign_id
      },
      campaign: {
        id: campaign_id,
        Campaign_User: {
          some: {
            userId: user_id,
            role: CampaignRole.gm
          }
        }
      },
      role: {
        not: CampaignRole.gm
      }
    }
  });
}

export async function createCampaign(
  user_id: string,
  campaign: Omit<Campaign, 'id' | 'createdAt'>
) {
  return await db.campaign.create({
    data: {
      ...campaign,
      Campaign_User: {
        create: [
          {
            user: {
              connect: {
                id: user_id
              }
            },
            role: CampaignRole.gm
          }
        ]
      }
    }
  });
}

export async function deleteCampaign(user_id: string, campaignId: string) {
  return await db.campaign.delete({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user_id,
          role: CampaignRole.gm
        }
      }
    }
  });
}

export async function addWikiToCampaign(user_id: string, campaignId: string, wikiId: string) {
  return await db.campaign.update({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user_id,
          role: CampaignRole.gm
        }
      }
    },
    data: {
      wikis: {
        connect: {
          id: wikiId,
          Wiki_User: {
            some: {
              userId: user_id
            }
          }
        }
      }
    }
  });
}

export async function removeWikiFromCampaign(user_id: string, campaignId: string, wikiId: string) {
  return await db.campaign.update({
    where: {
      id: campaignId,
      Campaign_User: {
        some: {
          userId: user_id,
          role: CampaignRole.gm
        }
      }
    },
    data: {
      wikis: {
        disconnect: {
          id: wikiId,
          Wiki_User: {
            some: {
              userId: user_id
            }
          }
        }
      }
    }
  });
}

