import { motion } from 'framer-motion';

export default function PointsTable() {
  const assetBase = import.meta.env.BASE_URL;
  const groupA = [
    { name: 'Nightmare', img: `${assetBase}nightmare.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
    { name: 'Phoenix', img: `${assetBase}phoenix.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
    { name: 'GZB GIANTS', img: `${assetBase}gg.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
    { name: 'Fire Falcons', img: `${assetBase}firefalcons.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
    { name: 'Revengers', img: `${assetBase}revengers.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
  ];

  const groupB = [
    { name: 'VNN warriors', img: `${assetBase}vnn.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
    { name: 'Death Warriors', img: `${assetBase}firefalcons.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
    { name: 'WSK', img: `${assetBase}wsk.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
    { name: 'INVADERS', img: `${assetBase}invaders.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
    { name: 'Dominators', img: `${assetBase}dominators.png`, m: 0, w: 0, l: 0, pts: 0, nrr: '0.00' },
  ];

  const renderTable = (groupData) => (
    <table className="group-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>M</th>
          <th>W</th>
          <th>L</th>
          <th>Pts</th>
          <th>NRR</th>
        </tr>
      </thead>
      <tbody>
        {groupData.map((team, idx) => (
          <tr key={team.name}>
            <td>{idx + 1}</td>
            <td>
              <span className="group-team">
                <img src={team.img} alt={team.name} />
                <span>{team.name}</span>
              </span>
            </td>
            <td>{team.m}</td>
            <td>{team.w}</td>
            <td>{team.l}</td>
            <td className="group-points">{team.pts}</td>
            <td>{team.nrr}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <section id="points-table" className="section match-section">
      <div className="section-heading">
        <h2>WBL Group Stage Points Table</h2>
        <a href="#points-table" className="view-all">Full Standings &rarr;</a>
      </div>

      <motion.div
        className="group-layout"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="group-card">
          <div className="group-header">Group A</div>
          <div style={{ overflowX: 'auto' }}>
            {renderTable(groupA)}
          </div>
        </div>

        <div className="group-card">
          <div className="group-header">Group B</div>
          <div style={{ overflowX: 'auto' }}>
            {renderTable(groupB)}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
