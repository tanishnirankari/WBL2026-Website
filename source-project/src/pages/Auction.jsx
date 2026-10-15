                      </label>
                      <select
                        value={formData.bowlingStyle}
                        onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Right-Arm Fast">Right-Arm Fast</option>
                        <option value="Right-Arm Medium">Right-Arm Medium</option>
                        <option value="Right-Arm Spin">Right-Arm Spin</option>
                        <option value="Left-Arm Fast">Left-Arm Fast</option>
                        <option value="Left-Arm Spin">Left-Arm Spin</option>
                        <option value="None">None</option>
                      </select>
                    </div>


                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Club / Academy Name
                      </label>
                      <input
                        type="text"
                        placeholder="Club / Academy"
                        value={formData.club}
                        onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                        style={inputStyle}
                      />
                    </div>


                    <div>
                      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 700 }}>
                        Expected Base Price
                      </label>
                      <select
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="₹1,000">₹1,000 (Emerging)</option>
                        <option value="₹2,000">₹2,000 (Category B)</option>
                        <option value="₹3,000">₹3,000 (Category A)</option>
                        <option value="₹4,000">₹4,000 (Icon Player)</option>
                      </select>
                    </div>
                  </div>


                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                      <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: '#cbd5e1',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={isSubmitting}
                      style={{ border: 'none', cursor: 'pointer', padding: '12px 28px' }}
                    >
                      {isSubmitting ? 'Submitting…' : 'Submit Player Registration →'}
                    </button>
                  </div>
