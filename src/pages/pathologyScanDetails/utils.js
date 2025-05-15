export const getUniqueOrgans = (slides) => {
    const uniqueOrgans = [];
    slides?.forEach((slide) => {
      const organ = slide.organ?.toLowerCase();
      if (organ && !uniqueOrgans.includes(organ)) {
        uniqueOrgans.push(organ);
      }
    });
    return uniqueOrgans;
}; 